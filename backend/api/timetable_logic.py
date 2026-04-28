import random
from collections import defaultdict

class TimetableGenerator:
    def __init__(self, staff_data, subject_data, sections, manual_assignments=None, slots_per_day=7, days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]):
        """
        staff_data: list of dicts { 'id': 1, 'name': 'John', 'subjects': ['Math'], 'max_hours_day': 6, 'assigned_sections': ['10th-A'] }
        subject_data: list of dicts { 'name': 'Math', 'hours_week': 5, 'grade': '10th' }
        sections: list of strings ['10th-A', '10th-B']
        manual_assignments: list of dicts { 'staff_id': 1, 'subject_name': 'Math', 'class_section': '10th-A' }
        """
        self.staff_data = staff_data
        self.subject_data = subject_data
        self.sections = sections
        self.manual_assignments = manual_assignments or []
        self.slots_per_day = slots_per_day
        self.days = days
        self.timetable = []

    def generate(self):
        # Tracking variables
        section_subject_hours = {} # (section, subject): remaining_hours
        for section in self.sections:
            for sub in self.subject_data:
                section_subject_hours[(section, sub['name'])] = sub['hours_week']

        staff_daily_hours = defaultdict(lambda: defaultdict(int)) # staff_id: { day: hours }
        staff_slot_busy = defaultdict(lambda: defaultdict(bool)) # staff_id: { (day, slot): is_busy }

        for day in self.days:
            for slot_idx in range(1, self.slots_per_day + 1):
                slot_label = f"Slot {slot_idx}"
                
                # Handle Lunch Break
                if slot_idx == 4:
                    for section in self.sections:
                        self.timetable.append({
                            'day': day,
                            'slot': slot_label,
                            'subject': 'LUNCH BREAK',
                            'teacher_name': 'N/A',
                            'class_section': section,
                            'room_number': 'Cafeteria'
                        })
                    continue

                for section in self.sections:
                    # 1. Check for manual assignments first
                    manual_match = None
                    for ma in self.manual_assignments:
                        if ma['class_section'] == section and section_subject_hours[(section, ma['subject_name'])] > 0:
                            # Verify if teacher is free
                            teacher = next((t for t in self.staff_data if t['id'] == ma['staff_id']), None)
                            if teacher and not staff_slot_busy[teacher['id']][(day, slot_label)] and staff_daily_hours[teacher['id']][day] < teacher['max_hours_day']:
                                manual_match = (ma['subject_name'], teacher)
                                break
                    
                    if manual_match:
                        sub_name, teacher = manual_match
                        self._allocate(day, slot_label, sub_name, teacher, section, section_subject_hours, staff_slot_busy, staff_daily_hours)
                        continue

                    # 2. Automated allocation
                    possible_subjects = [s['name'] for s in self.subject_data if section_subject_hours[(section, s['name'])] > 0]
                    random.shuffle(possible_subjects)

                    allocated = False
                    for sub_name in possible_subjects:
                        eligible_teachers = [t for t in self.staff_data 
                                           if sub_name in t['subjects'] 
                                           and section in t['assigned_sections']
                                           and not staff_slot_busy[t['id']][(day, slot_label)]
                                           and staff_daily_hours[t['id']][day] < t['max_hours_day']]
                        
                        if eligible_teachers:
                            teacher = random.choice(eligible_teachers)
                            self._allocate(day, slot_label, sub_name, teacher, section, section_subject_hours, staff_slot_busy, staff_daily_hours)
                            allocated = True
                            break
                    
                    if not allocated:
                        self.timetable.append({
                            'day': day,
                            'slot': slot_label,
                            'subject': 'FREE PERIOD',
                            'teacher_name': 'N/A',
                            'class_section': section,
                            'room_number': 'Library'
                        })

        return self.timetable

    def _allocate(self, day, slot, sub_name, teacher, section, section_subject_hours, staff_slot_busy, staff_daily_hours):
        self.timetable.append({
            'day': day,
            'slot': slot,
            'subject': sub_name,
            'teacher_name': teacher['name'],
            'class_section': section,
            'room_number': f"R-{section.split('-')[0]}"
        })
        section_subject_hours[(section, sub_name)] -= 1
        staff_slot_busy[teacher['id']][(day, slot)] = True
        staff_daily_hours[teacher['id']][day] += 1

class ResourcePlanner:
    @staticmethod
    def calculate_staff_needs(subjects, sections):
        """
        subjects: QuerySet of Subject models
        sections: list of sections
        returns: dict { subject_name: required_staff_count }
        """
        needs = {}
        for sub in subjects:
            total_hours_needed = sub.hours_per_week * len(sections)
            # Assume average teacher handles 25 hours a week (5 days * 5 hours)
            avg_teacher_capacity = 25 
            required_staff = (total_hours_needed + avg_teacher_capacity - 1) // avg_teacher_capacity
            needs[sub.name] = {
                'total_hours': total_hours_needed,
                'staff_count': max(1, required_staff)
            }
        return needs

def run_allocation():
    from .models import StaffProfile, Subject, User, StaffAssignment
    
    subjects = Subject.objects.all()
    staff_profiles = StaffProfile.objects.select_related('user').prefetch_related('subjects').all()
    manual_assignments_qs = StaffAssignment.objects.select_related('staff', 'subject').all()
    
    sections = set()
    for profile in staff_profiles:
        for section in profile.assigned_sections:
            sections.add(section)
    
    staff_data = []
    for sp in staff_profiles:
        staff_data.append({
            'id': sp.user.id,
            'name': sp.user.username,
            'subjects': [s.name for s in sp.subjects.all()],
            'max_hours_day': sp.max_hours_per_day,
            'assigned_sections': sp.assigned_sections
        })
        
    subject_data = [{'name': s.name, 'hours_week': s.hours_per_week} for s in subjects]
    
    manual_assignments = []
    for ma in manual_assignments_qs:
        manual_assignments.append({
            'staff_id': ma.staff.id,
            'subject_name': ma.subject.name,
            'class_section': ma.class_section
        })
    
    generator = TimetableGenerator(staff_data, subject_data, list(sections), manual_assignments)
    return generator.generate()
