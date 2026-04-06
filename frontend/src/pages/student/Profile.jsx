import { useState, useEffect } from 'react';
import { User, Phone, BookOpen, Building2, Shield, Save } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import studentService from '../../services/student.service';
import toast from 'react-hot-toast';

const Profile = () => {
  // ---- State ----
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // formData holds the EDITABLE copy of the profile
  // When user types, formData changes but profile (original) stays the same
  // This lets us compare and know what actually changed
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '',
    college_id: '',
    branch: '',
    year: 1,
    semester: 1,
    guardian: {
      name: '',
      phone: '',
    },
  });

  // ---- Fetch profile on mount ----
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await studentService.getProfile();
        const data = response.data.data.student;

        setProfile(data);

        // Populate form with existing data
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          // MongoDB stores dates as ISO strings: "2000-05-15T00:00:00.000Z"
          // .split('T')[0] extracts just "2000-05-15"
          // This format is what <input type="date"> expects
          college_id: data.college_id || '',
          branch: data.branch || '',
          year: data.year || 1,
          semester: data.semester || 1,
          guardian: {
            name: data.guardian?.name || '',
            phone: data.guardian?.phone || '',
          },
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ---- Handle input changes ----
  // This ONE function handles ALL input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Destructure the event target to get the input's name and value
    // <input name="phone" value="123"> → name="phone", value="123"

    // Check if it's a guardian field
    if (name.startsWith('guardian.')) {
      // name = "guardian.name" or "guardian.phone"
      const field = name.split('.')[1]; // Extract "name" or "phone"

      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [field]: value,
        },
      }));
      // Explanation:
      // ...prev = keep all existing form data
      // guardian: { ...prev.guardian, [field]: value }
      //   = keep existing guardian fields, but update the changed one
      //
      // [field] is a "computed property name"
      // If field = "name", then [field] = "name"
      // It's like writing { name: value } but the key is dynamic
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ---- Handle number input changes ----
  // Numbers need parseInt conversion
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) || 1,
      // parseInt converts string "3" to number 3
      // || 1 provides fallback if parsing fails (NaN → 1)
    }));
  };

  // ---- Handle form submission ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setSaving(true);

    try {
      // Build the update payload
      // Only include fields that actually changed
      const updates = {};

      if (formData.name !== profile.name) updates.name = formData.name;
      if (formData.phone !== (profile.phone || '')) updates.phone = formData.phone;
      if (formData.gender !== (profile.gender || '')) updates.gender = formData.gender;
      if (formData.college_id !== (profile.college_id || '')) updates.college_id = formData.college_id;
      if (formData.branch !== (profile.branch || '')) updates.branch = formData.branch;
      if (formData.year !== profile.year) updates.year = formData.year;
      if (formData.semester !== profile.semester) updates.semester = formData.semester;

      // Handle date comparison
      const originalDob = profile.dob ? profile.dob.split('T')[0] : '';
      if (formData.dob !== originalDob) updates.dob = formData.dob;

      // Handle guardian
      const guardianChanged =
        formData.guardian.name !== (profile.guardian?.name || '') ||
        formData.guardian.phone !== (profile.guardian?.phone || '');

      if (guardianChanged) {
        updates.guardian = formData.guardian;
      }

      // Check if anything actually changed
      if (Object.keys(updates).length === 0) {
        toast('No changes to save', { icon: 'ℹ️' });
        setSaving(false);
        return;
      }

      // Send update request
      const response = await studentService.updateProfile(updates);

      // Update the original profile with new data
      setProfile(response.data.data.student);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======== PERSONAL DETAILS ======== */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </Card>

        {/* ======== ACADEMIC DETAILS ======== */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Academic Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* College ID / PRN */}
            <div>
              <label htmlFor="college_id" className="block text-sm font-medium text-gray-700 mb-1">
                College ID / PRN
              </label>
              <input
                id="college_id"
                name="college_id"
                type="text"
                value={formData.college_id}
                onChange={handleChange}
                placeholder="Enter your PRN or roll number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch / Department
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ======== HOSTEL DETAILS (Read-Only) ======== */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Hostel Details
            </h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Managed by Admin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* All hostel fields are disabled — only admin can change these */}
            {[
              { label: 'Block', value: profile?.hostel_block || 'Not assigned' },
              { label: 'Room No', value: profile?.room_no || 'Not assigned' },
              { label: 'Floor', value: profile?.floor ?? 'Not assigned' },
              { label: 'Bed No', value: profile?.bed_no ?? 'Not assigned' },
            ].map((item) => (
              <div key={item.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {item.label}
                </label>
                <input
                  type="text"
                  value={item.value}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ======== GUARDIAN DETAILS ======== */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Guardian Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guardian Name */}
            <div>
              <label htmlFor="guardian.name" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name
              </label>
              <input
                id="guardian.name"
                name="guardian.name"
                type="text"
                value={formData.guardian.name}
                onChange={handleChange}
                placeholder="Enter guardian's name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label htmlFor="guardian.phone" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Phone
              </label>
              <input
                id="guardian.phone"
                name="guardian.phone"
                type="tel"
                value={formData.guardian.phone}
                onChange={handleChange}
                placeholder="Enter guardian's phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </Card>

        {/* ======== SAVE BUTTON ======== */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;