
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MapPin, Video, Phone, User, Edit, Trash2 } from 'lucide-react';
import { useInterviewSchedules, InterviewSchedule } from '@/hooks/useInterviewSchedules';
import { InterviewScheduleForm } from '@/components/InterviewScheduleForm';

export default function InterviewSchedulePage() {
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } = useInterviewSchedules();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InterviewSchedule | null>(null);

  const handleCreate = async (data: any) => {
    const success = await createSchedule(data);
    if (success) {
      setIsCreateModalOpen(false);
    }
    return success;
  };

  const handleEdit = (schedule: InterviewSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedSchedule) return false;
    const success = await updateSchedule(selectedSchedule.schedules_uuid, data);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
    }
    return success;
  };

  const handleDelete = async (schedule: InterviewSchedule) => {
    if (window.confirm('Are you sure you want to delete this interview schedule?')) {
      await deleteSchedule(schedule.schedules_uuid);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getInterviewTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
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
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Schedules</h1>
          <p className="text-gray-600 mt-1">Manage and track interview schedules</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Interview Schedule
        </Button>
      </div>

      {/* Interview Schedules Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Interview Schedules</CardTitle>
          </div>
          <CardDescription>
            View and manage all scheduled interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading interview schedules...</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Vacancy</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.schedules_uuid}>
                      <TableCell>
                        <div className="font-medium">{schedule.candidate_name}</div>
                        {schedule.candidate?.candidates_name && 
                         schedule.candidate.candidates_name !== schedule.candidate_name && (
                          <div className="text-xs text-gray-500">
                            {schedule.candidate.candidates_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{schedule.company?.name || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {schedule.vacancy?.title || schedule.vacancy?.vacancy_title || 'Unknown Position'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{formatDate(schedule.interview_date)}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(schedule.interview_time)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getInterviewTypeIcon(schedule.interview_type)}
                          <span className="capitalize">{schedule.interview_type || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.interview_location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{schedule.interview_location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.interviewer_name ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{schedule.interviewer_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(schedule.status || 'scheduled')}>
                          {schedule.status || 'scheduled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(schedule)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Interview Schedules
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first interview schedule.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Interview Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Schedule Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Interview Schedule</DialogTitle>
          </DialogHeader>
          <InterviewScheduleForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Interview Schedule</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <InterviewScheduleForm
              schedule={selectedSchedule}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedSchedule(null);
              }}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
