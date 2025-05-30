
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Bell, Check, CheckCheck, Clock, Info, MailWarning, MessagesSquare, RefreshCw, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  {
    id: 1,
    title: "New project assigned",
    description: "You have been assigned to the project 'Commercial Tower'",
    type: "project",
    read: false,
    time: "5 minutes ago"
  },
  {
    id: 2,
    title: "Task due tomorrow",
    description: "Task 'Foundation Work' is due tomorrow",
    type: "task",
    read: false,
    time: "1 hour ago"
  },
  {
    id: 3,
    title: "Design approved",
    description: "Your design 'Tower Elevation' has been approved",
    type: "design",
    read: true,
    time: "3 hours ago"
  },
  {
    id: 4,
    title: "Invoice paid",
    description: "Invoice #INV001 has been paid by ABC Developers",
    type: "invoice",
    read: true,
    time: "Yesterday"
  },
  {
    id: 5,
    title: "Material request approved",
    description: "Your request for 'Steel Rods' has been approved",
    type: "material",
    read: true,
    time: "2 days ago"
  },
  {
    id: 6,
    title: "System maintenance",
    description: "System will be down for maintenance on Sunday, 10 PM - 12 AM",
    type: "system",
    read: true,
    time: "3 days ago"
  },
];

const getIcon = (type: string, read: boolean) => {
  switch (type) {
    case "project":
      return <Info className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-blue-500'}`} />;
    case "task":
      return <Clock className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-amber-500'}`} />;
    case "design":
      return <CheckCheck className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-green-500'}`} />;
    case "invoice":
      return <Check className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-green-500'}`} />;
    case "material":
      return <Check className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-blue-500'}`} />;
    case "system":
      return <MailWarning className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-red-500'}`} />;
    default:
      return <Info className={`h-5 w-5 ${read ? 'text-muted-foreground' : 'text-blue-500'}`} />;
  }
};

const Notifications = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with system alerts and messages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Your Notifications
              <Badge>{notifications.filter(n => !n.read).length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MessagesSquare className="mr-1 h-4 w-4" />
                Messages
              </Button>
              <Button variant="ghost" size="sm">
                <Archive className="mr-1 h-4 w-4" />
                Archive
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              <TabsContent value="all" className="m-0">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`
                      flex gap-3 p-3 border-b last:border-0
                      ${notification.read ? '' : 'bg-muted/50'}
                    `}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getIcon(notification.type, notification.read)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="unread" className="m-0">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex gap-3 p-3 border-b last:border-0 bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getIcon(notification.type, notification.read)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="read" className="m-0">
                {notifications.filter(n => n.read).map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex gap-3 p-3 border-b last:border-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getIcon(notification.type, notification.read)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
