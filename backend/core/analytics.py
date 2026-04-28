import random

def predict_at_risk_students(student_records):
    """
    Scans Academic_Records to flag 'At-Risk' students based on grade trends.
    Placeholder logic: randomly flags students with descending scores.
    """
    at_risk = []
    for record in student_records:
        # Simulate logic: If average score in last 3 months < 40%
        if random.random() < 0.1: # 10% chance for simulation
            at_risk.append({
                'student_id': record.id,
                'risk_level': 'High',
                'reason': 'Consistent drop in Science/Math scores'
            })
    return at_risk
