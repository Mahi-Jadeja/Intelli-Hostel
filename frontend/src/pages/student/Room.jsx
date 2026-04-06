import { useState, useEffect } from 'react';
import {
  BedDouble,
  Building2,
  Layers,
  Users,
  Phone,
  BookOpen,
  Mail,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/student.service';
import toast from 'react-hot-toast';

const Room = () => {
  const [roomData, setRoomData] = useState(null);
  const [bedNo, setBedNo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRoom, setHasRoom] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await studentService.getRoom();
        const data = response.data.data;

        if (data.room) {
          setRoomData(data.room);
          setBedNo(data.bed_no);
          setHasRoom(true);
        } else {
          setHasRoom(false);
        }
      } catch (error) {
        console.error('Failed to fetch room:', error);
        toast.error('Failed to load room information');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, []);

  // ---- Loading State ----
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Room Allocation
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ---- No Room Allocated ----
  if (!hasRoom) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Room Allocation
        </h1>
        <Card className="p-6">
          <EmptyState
            icon={BedDouble}
            title="No Room Allocated"
            description="You haven't been allocated a room yet. Please contact the hostel warden for room allocation."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Room Allocation</h1>

      {/* ======== ROOM INFO CARDS ======== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Block */}
        <Card className="p-4 text-center">
          <Building2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Block</p>
          <p className="text-xl font-bold text-gray-900">
            {roomData.hostel_block}
          </p>
        </Card>

        {/* Room Number */}
        <Card className="p-4 text-center">
          <BedDouble className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Room</p>
          <p className="text-xl font-bold text-gray-900">
            {roomData.room_no}
          </p>
        </Card>

        {/* Floor */}
        <Card className="p-4 text-center">
          <Layers className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Floor</p>
          <p className="text-xl font-bold text-gray-900">
            {roomData.floor}
          </p>
        </Card>

        {/* Bed */}
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Bed</p>
          <p className="text-xl font-bold text-gray-900">
            {bedNo || '-'}
          </p>
        </Card>
      </div>

      {/* ======== ROOM STATUS ======== */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-sm text-gray-500">Status: </span>
            <Badge status={roomData.status}>
              {roomData.status.charAt(0).toUpperCase() + roomData.status.slice(1)}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-gray-500">Capacity: </span>
            <span className="text-sm font-medium text-gray-900">
              {roomData.occupied} / {roomData.capacity}
            </span>
          </div>
          <div>
            {/* Visual occupancy bar */}
            <span className="text-sm text-gray-500">Occupancy: </span>
            <div className="inline-flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    roomData.occupied >= roomData.capacity
                      ? 'bg-red-500'
                      : roomData.occupied > 0
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(roomData.occupied / roomData.capacity) * 100}%`,
                  }}
                  // Inline style for dynamic width
                  // Tailwind can't generate dynamic percentage classes
                  // So we use style={{ width: '66%' }} etc.
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round((roomData.occupied / roomData.capacity) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ======== ROOMMATES ======== */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Roommates ({roomData.roommates?.length || 0})
        </h2>

        {roomData.roommates?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomData.roommates.map((mate) => (
              <div
                key={mate._id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                  {mate.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {mate.name}
                  </p>

                  {mate.branch && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {mate.branch}
                        {mate.year ? `, Year ${mate.year}` : ''}
                      </span>
                    </div>
                  )}

                  {mate.college_id && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      PRN: {mate.college_id}
                    </p>
                  )}

                  {mate.phone && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{mate.phone}</span>
                    </div>
                  )}

                  {mate.email && (
                    <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{mate.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No roommates yet</p>
            <p className="text-sm text-gray-400">
              You have the room all to yourself!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Room;