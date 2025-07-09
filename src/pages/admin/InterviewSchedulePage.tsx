
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInterviewSchedules, InterviewSchedule } from '@/hooks/useInterviewSchedules';
import { InterviewScheduleForm } from '@/components/InterviewScheduleForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function InterviewSchedulePage() {
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } = useInterviewSchedules();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<InterviewSchedule | undefined>();

  const handleCreateSchedule = async (data: any) => {
    const success = await createSchedule(data);
    if (success) {
      setIsFormOpen(false);
    }
    return success;
  };

  const handleUpdateSchedule = async (data: any) => {
    if (!editingSchedule) return false;
    const success = await updateSchedule(editingSchedule.schedules_uuid, data);
    if (success) {
      setEditingSchedule(undefined);
      setIsFormOpen(false);
    }
    return success;
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteSchedule(scheduleId);
  };

  const handleEdit = (schedule: InterviewSchedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSchedule(undefined);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isFormOpen) {
    return (
      <div className="container mx-auto p-6">
        <InterviewScheduleForm
          schedule={editingSchedule}
          onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Interview Schedules</h1>
          <p className="text-gray-600 mt-2">Manage and track interview schedules</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading interview schedules...</div>
        </div>
      ) : schedules.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No interview schedules</h3>
            <p className="text-gray-600 mb-4">Get started by scheduling your first interview</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <Card key={schedule.schedules_uuid} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {schedule.vacancy?.title || schedule.vacancy?.vacancy_title || 'Interview'}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building className="h-4 w-4" />
                      <span>{schedule.company?.name || 'Unknown Company'}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status || 'Scheduled'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Candidate:</span>
                  <span>{schedule.candidate_name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(schedule.interview_date)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>{formatTime(schedule.interview_time)}</span>
                </div>

                {schedule.interview_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{schedule.interview_location}</span>
                  </div>
                )}

                {schedule.interview_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {schedule.interview_type}
                    </Badge>
                  </div>
                )}

                {schedule.interviewer_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Interviewer:</span>
                    <span>{schedule.interviewer_name}</span>
                  </div>
                )}

                {schedule.meeting_link && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Meeting Link:</span>
                    <a 
                      href={schedule.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Interview Schedule</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this interview schedule? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteSchedule(schedule.schedules_uuid)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {formatDate(schedule.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
