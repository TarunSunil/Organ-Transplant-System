from __future__ import annotations

"""Enhanced matching logic for donor -> recipient allocation.

The goal is to produce deterministic, data-driven scores instead of
template AI responses. Scoring dimensions:

1. Medical Compatibility (50%)
   - Blood type compatibility (ABO + universal donor logic)
   - Exact organ match (required; otherwise score 0)
2. Geographic Proximity (20%)
   - Simple heuristic on string similarity / equality of locations.
3. Fairness (30%)
   - Urgency level (higher urgency gets higher share)
   - Age priority (younger recipients may get slight boost)

Return structure for each recipient:
{
  'medical_score': float (0-100),
  'geographic_score': float (0-100),
  'fairness_score': float (0-100),
  'overall_score': float (0-100)
}
"""

from typing import List, Tuple, Dict, Any
from math import exp

try:  # Local imports (used at runtime by FastAPI)
    from app import models
except Exception:  # pragma: no cover - fallback for type checking tools
    from .. import models  # type: ignore


class EnhancedMatcher:
    MEDICAL_WEIGHT = 0.50
    GEO_WEIGHT = 0.20
    FAIRNESS_WEIGHT = 0.30

    @staticmethod
    def blood_type_compatibility(donor_bt: str | None, recipient_bt: str | None) -> float:
        if not donor_bt or not recipient_bt:
            return 0.0
        donor_bt = donor_bt.upper().strip()
        recipient_bt = recipient_bt.upper().strip()

        # Basic ABO + universal donor/recipient rules
        # Map of recipient -> acceptable donor types
        compatibility = {
            'O': {'O'},
            'A': {'A', 'O'},
            'B': {'B', 'O'},
            'AB': {'A', 'B', 'AB', 'O'},
        }

        # Strip +/- for simplicity (Rh factor ignored for now)
        donor_core = donor_bt.replace('+', '').replace('-', '')
        recipient_core = recipient_bt.replace('+', '').replace('-', '')

        if recipient_core not in compatibility:
            return 0.0
        return 100.0 if donor_core in compatibility[recipient_core] else 0.0

    @staticmethod
    def organ_match(donor_organ: str | None, needed: str | None) -> float:
        if not donor_organ or not needed:
            return 0.0
        return 100.0 if donor_organ.lower().strip() == needed.lower().strip() else 0.0

    @staticmethod
    def medical_score(donor: models.Donor, recipient: models.Recipient) -> float:
        bt = EnhancedMatcher.blood_type_compatibility(donor.blood_type, recipient.blood_type)
        organ = EnhancedMatcher.organ_match(donor.organ, recipient.organ_needed)
        # Require organ match; if organ mismatch, medical score is 0 regardless of blood type
        if organ == 0.0:
            return 0.0
        return 0.7 * organ + 0.3 * bt  # weight organ higher inside medical dimension

    @staticmethod
    def geographic_score(donor: models.Donor, recipient: models.Recipient) -> float:
        d_loc = (donor.location or '').strip().lower()
        r_loc = (recipient.location or '').strip().lower()
        if not d_loc or not r_loc:
            return 0.0
        if d_loc == r_loc:
            return 100.0
        # Basic partial similarity heuristic
        if d_loc in r_loc or r_loc in d_loc:
            return 60.0
        # Very rough distance proxy via first char comparison
        if d_loc[:1] == r_loc[:1]:
            return 40.0
        return 10.0

    @staticmethod
    def fairness_score(recipient: models.Recipient) -> float:
        # Urgency level: assume scale 1..5 (fallback if outside)
        urgency = getattr(recipient, 'urgency_level', 1) or 1
        urgency = max(1, min(urgency, 5))
        urgency_component = (urgency / 5.0) * 100.0  # 20,40,60,80,100

        # Age priority: mild exponential decay – younger age => higher score
        age = getattr(recipient, 'age', None)
        if age is None:
            age_component = 50.0  # neutral default
        else:
            # Age 0 -> ~100, Age 80 -> ~45, Age 100 -> ~37
            age_component = 100.0 * exp(- (age / 100.0))

        # Combine (urgency heavier inside fairness dimension)
        return 0.65 * urgency_component + 0.35 * age_component

    @staticmethod
    def compute_scores(donor: models.Donor, recipient: models.Recipient) -> Dict[str, float]:
        medical = EnhancedMatcher.medical_score(donor, recipient)
        geo = EnhancedMatcher.geographic_score(donor, recipient)
        fair = EnhancedMatcher.fairness_score(recipient)
        overall = (
            EnhancedMatcher.MEDICAL_WEIGHT * medical +
            EnhancedMatcher.GEO_WEIGHT * geo +
            EnhancedMatcher.FAIRNESS_WEIGHT * fair
        )
        return {
            'medical_score': round(medical, 2),
            'geographic_score': round(geo, 2),
            'fairness_score': round(fair, 2),
            'overall_score': round(overall, 2)
        }

    @staticmethod
    def find_best_matches(donor: models.Donor, recipients: List[models.Recipient], limit: int = 5) -> List[Tuple[models.Recipient, Dict[str, float]]]:
        scored: List[Tuple[models.Recipient, Dict[str, float]]] = []
        for r in recipients:
            scores = EnhancedMatcher.compute_scores(donor, r)
            # Only include if there is at least some medical compatibility (>0)
            if scores['medical_score'] > 0:
                scored.append((r, scores))
        scored.sort(key=lambda tup: tup[1]['overall_score'], reverse=True)
        return scored[:limit]
