export default function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['#7C6AF7','#3ABCA8','#E27259','#D45C8C','#4FA3E0','#6ABF56'];
  const bg = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className="avatar-initials" style={{ background: bg }}>
      {initials}
    </div>
  );
}