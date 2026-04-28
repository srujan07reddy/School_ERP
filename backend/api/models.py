from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Accountant', 'Accountant'),
        ('SectionCoord', 'Section Coordinator'),
        ('Staff', 'Staff'),
        ('StudentParent', 'Student/Parent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    address = models.TextField(blank=True, null=True)

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    section = models.CharField(max_length=50)
    grade = models.CharField(max_length=10)
    parent_name = models.CharField(max_length=100)

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=(('Present', 'Present'), ('Absent', 'Absent'), ('Late', 'Late')))

class Transaction(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=(('Paid', 'Paid'), ('Pending', 'Pending')))
    description = models.CharField(max_length=255)

class BusRoute(models.Model):
    bus_number = models.CharField(max_length=20)
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=20, blank=True, null=True)
    route_name = models.CharField(max_length=200, blank=True, null=True)
    current_stop = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default='On Time') # On Time, Delayed
    student_count = models.IntegerField(default=0)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

class TimetableEntry(models.Model):
    day = models.CharField(max_length=20) # Monday, Tuesday...
    slot = models.CharField(max_length=20) # 08:00 AM...
    subject = models.CharField(max_length=100)
    teacher_name = models.CharField(max_length=100)
    class_section = models.CharField(max_length=50) # e.g. 10th-A
    room_number = models.CharField(max_length=20)
    is_optimized = models.BooleanField(default=True)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    deadline = models.DateField()
    total_marks = models.IntegerField(default=100)
    submissions = models.IntegerField(default=0)
    class_name = models.CharField(max_length=50) # e.g. Primary-A
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    class_name = models.CharField(max_length=50)
    sender_name = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True)

class LeaveRequest(models.Model):
    STATUS_CHOICES = (('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver_role = models.CharField(max_length=50) # Admin or Coordinator
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date = models.CharField(max_length=50)

class Substitution(models.Model):
    absent_staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='absent_subs')
    substitute_staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='covering_subs')
    date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    hours_per_week = models.IntegerField(default=5)
    grade_level = models.CharField(max_length=20, default="General")

    def __str__(self):
        return f"{self.name} ({self.grade_level})"

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    subjects = models.ManyToManyField(Subject, related_name='teachers')
    max_hours_per_day = models.IntegerField(default=6)
    assigned_sections = models.JSONField(default=list) # e.g. ["10th-A", "10th-B"]

    def __str__(self):
        return f"Staff: {self.user.username}"

class StaffAssignment(models.Model):
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='manual_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_section = models.CharField(max_length=50) # e.g. "10th-A"

    def __str__(self):
        return f"{self.staff.username} -> {self.subject.name} in {self.class_section}"
