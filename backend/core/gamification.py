def calculate_student_rank_score(student_id, attendance_streak, average_grade):
    """
    Calculates a 'Performance Score' based on attendance and grades.
    Used for score-based ranking.
    """
    base_score = average_grade * 10
    bonus = attendance_streak * 2
    total_score = base_score + bonus
    
    rank = "Gold" if total_score > 90 else "Silver" if total_score > 75 else "Bronze"
    
    return {
        'student_id': student_id,
        'performance_score': total_score,
        'academic_rank': rank,
        'message': f'Your current rank is {rank} with a score of {total_score}.'
    }
