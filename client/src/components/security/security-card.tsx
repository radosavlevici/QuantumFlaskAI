import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SecurityCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: "green" | "blue" | "yellow" | "red" | "purple" | "gray";
  actionText: string;
  actionHref: string;
}

export default function SecurityCard({
  title,
  value,
  icon: Icon,
  iconColor,
  actionText,
  actionHref,
}: SecurityCardProps) {
  // Define color mappings for different styles
  const colorMapping = {
    green: {
      bgLight: "bg-green-100",
      bgDark: "dark:bg-green-900/30",
      text: "text-green-600",
      textDark: "dark:text-green-400",
    },
    blue: {
      bgLight: "bg-blue-100",
      bgDark: "dark:bg-blue-900/30",
      text: "text-blue-600",
      textDark: "dark:text-blue-400",
    },
    yellow: {
      bgLight: "bg-yellow-100",
      bgDark: "dark:bg-yellow-900/30",
      text: "text-yellow-600",
      textDark: "dark:text-yellow-400",
    },
    red: {
      bgLight: "bg-red-100",
      bgDark: "dark:bg-red-900/30",
      text: "text-red-600",
      textDark: "dark:text-red-400",
    },
    purple: {
      bgLight: "bg-purple-100",
      bgDark: "dark:bg-purple-900/30",
      text: "text-purple-600",
      textDark: "dark:text-purple-400",
    },
    gray: {
      bgLight: "bg-gray-100",
      bgDark: "dark:bg-gray-900/30",
      text: "text-gray-600",
      textDark: "dark:text-gray-400",
    },
  };

  const colors = colorMapping[iconColor];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colors.bgLight} ${colors.bgDark} rounded-md p-3`}>
            <Icon className={`h-5 w-5 ${colors.text} ${colors.textDark}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <a href={actionHref} className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
            {actionText}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
