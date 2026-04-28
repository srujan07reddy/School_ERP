from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentViewSet, AttendanceViewSet, TransactionViewSet, 
    BusRouteViewSet, MessageViewSet, AssignmentViewSet, NoteViewSet, 
    LeaveRequestViewSet, SubstitutionViewSet, TimetableEntryViewSet,
    SubjectViewSet, StaffProfileViewSet, StaffAssignmentViewSet, 
    GenerateTimetableAPIView, ResourcePlanningAPIView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'bus-routes', BusRouteViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'substitutions', SubstitutionViewSet)
router.register(r'timetable', TimetableEntryViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'staff-profiles', StaffProfileViewSet)
router.register(r'staff-assignments', StaffAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate-timetable/', GenerateTimetableAPIView.as_view(), name='generate-timetable'),
    path('resource-planning/', ResourcePlanningAPIView.as_view(), name='resource-planning'),
]
