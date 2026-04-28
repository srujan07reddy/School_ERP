from rest_framework import viewsets
from .models import User, Student, Attendance, Transaction, BusRoute, Message, Assignment, Note, LeaveRequest, Substitution, TimetableEntry, Subject, StaffProfile, StaffAssignment
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .timetable_logic import run_allocation, ResourcePlanner
from .serializers import (
    UserSerializer, StudentSerializer, AttendanceSerializer, 
    TransactionSerializer, BusRouteSerializer, MessageSerializer,
    AssignmentSerializer, NoteSerializer, LeaveRequestSerializer, SubstitutionSerializer,
    TimetableEntrySerializer, SubjectSerializer, StaffProfileSerializer, StaffAssignmentSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class BusRouteViewSet(viewsets.ModelViewSet):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

class SubstitutionViewSet(viewsets.ModelViewSet):
    queryset = Substitution.objects.all()
    serializer_class = SubstitutionSerializer

class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.all()
    serializer_class = TimetableEntrySerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer

class StaffAssignmentViewSet(viewsets.ModelViewSet):
    queryset = StaffAssignment.objects.all()
    serializer_class = StaffAssignmentSerializer

class ResourcePlanningAPIView(APIView):
    def get(self, request):
        subjects = Subject.objects.all()
        # Get all unique sections from students
        sections = list(Student.objects.values_list('section', flat=True).distinct())
        if not sections:
            sections = ["10th-A", "10th-B"] # Fallback for demo
            
        planner = ResourcePlanner()
        needs = planner.calculate_staff_needs(subjects, sections)
        return Response(needs)

class GenerateTimetableAPIView(APIView):
    def post(self, request):
        try:
            # Clear existing timetable entries if requested or as a standard procedure
            # TimetableEntry.objects.all().delete()
            
            entries = run_allocation()
            
            # Save entries to database
            db_entries = []
            for entry in entries:
                db_entries.append(TimetableEntry(
                    day=entry['day'],
                    slot=entry['slot'],
                    subject=entry['subject'],
                    teacher_name=entry['teacher_name'],
                    class_section=entry['class_section'],
                    room_number=entry['room_number']
                ))
            
            TimetableEntry.objects.bulk_create(db_entries)
            
            return Response({"status": "success", "message": f"Generated {len(entries)} entries"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
