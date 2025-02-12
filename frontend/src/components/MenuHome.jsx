import {
  MessageSquare,
  FileText,
  CheckSquare,
  Cloud,
  Briefcase,
  Settings,
} from "lucide-react";
import NavItem from "./ui/NavItem";

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center bg-blue-600 text-white py-4">
      <div className="w-10 h-10 mb-8 rounded-full overflow-hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EH5rBS9KUE1nQKihhTkrqSJkGH4jgY.png"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-4">
        <NavItem href="/messages" icon={<MessageSquare />} label="Messages" />
        <NavItem href="/documents" icon={<FileText />} label="Documents" />
        <NavItem href="/tasks" icon={<CheckSquare />} label="Tasks" />
      </nav>

      <div className="flex flex-col items-center gap-4 mb-4">
        <NavItem href="/cloud" icon={<Cloud />} label="Cloud Storage" />
        <div className="w-8 h-px bg-blue-400 my-2" aria-hidden="true" />
        <NavItem href="/work" icon={<Briefcase />} label="Work" />
        <NavItem href="/settings" icon={<Settings />} label="Settings" />
      </div>
    </aside>
  );
};

export default Sidebar;
