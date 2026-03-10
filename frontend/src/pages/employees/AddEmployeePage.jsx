import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { createUserApi } from "../../api/userApi";
import { getDepartmentsApi } from "../../api/departmentApi";

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "employee",
    department: "",
    joiningDate: "",
    password: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await getDepartmentsApi();
      setDepartments(data.data || []);
    } catch {
      // non-critical
    }
  };

  const handleChange = (field, value) => {
    let finalValue = value;
    if (field === "firstName" || field === "lastName") {
      finalValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "phone") {
      finalValue = value.replace(/[^0-9+\-\s()]/g, "");
    } else if (field === "email") {
      finalValue = value.toLowerCase();
    }

    setForm((prev) => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const specials = "!@#$%&*";
    let pw = "";
    for (let i = 0; i < 10; i++)
      pw += chars[Math.floor(Math.random() * chars.length)];
    pw += specials[Math.floor(Math.random() * specials.length)];
    pw += String(Math.floor(Math.random() * 10));
    handleChange("password", pw);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!form.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        department: form.department || undefined,
        joiningDate: form.joiningDate || undefined,
        password: form.password,
      };

      await createUserApi(payload);
      toast.success("Employee created successfully");
      navigate("/employees");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create employee";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
      </div>

      <PageHeader
        title="Add Employee"
        description="Create a new employee account"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Personal Information</Card.Title>
                <Card.Description>
                  Basic details about the employee
                </Card.Description>
              </Card.Header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  error={errors.firstName}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  error={errors.lastName}
                  placeholder="Doe"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={errors.email}
                  placeholder="john.doe@company.com"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Employment Details</Card.Title>
                <Card.Description>
                  Role and department information
                </Card.Description>
              </Card.Header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Role"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  error={errors.role}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Select>
                <Select
                  label="Department"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                >
                  <option value="">No Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Joining Date"
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => handleChange("joiningDate", e.target.value)}
                />
              </div>
            </Card>
          </div>

          {/* Password Section */}
          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Account Password</Card.Title>
                <Card.Description>
                  Set the initial login password
                </Card.Description>
              </Card.Header>
              <div className="space-y-4">
                <Input
                  label="Password"
                  type="text"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  placeholder="Min 8 characters"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={generatePassword}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Auto-Generate Password
                </Button>
                {form.password && (
                  <div className="bg-surface-50 rounded-lg p-3">
                    <p className="text-xs text-surface-400 mb-1">
                      Generated password:
                    </p>
                    <p className="text-sm font-mono text-surface-700 break-all">
                      {form.password}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Create Employee
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => navigate("/employees")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
