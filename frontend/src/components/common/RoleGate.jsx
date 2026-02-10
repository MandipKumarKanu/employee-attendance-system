import useAuthStore from '../../stores/authStore';

export default function RoleGate({ roles, children, fallback = null }) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
}
