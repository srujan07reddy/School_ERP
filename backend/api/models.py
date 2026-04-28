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
    latitude = models.FloatField()
    longitude = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_encrypted = models.BooleanField(default=True)
    time_gated_until = models.DateTimeField(null=True, blank=True)
