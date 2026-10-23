from django.urls import path
from .views import (
    NoteListCreateView,
    NoteDetailView,
    LoginAPIView,
    SignupAPIView,
)

urlpatterns = [
    path('notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('signup/', SignupAPIView.as_view(), name='signup'),
]
