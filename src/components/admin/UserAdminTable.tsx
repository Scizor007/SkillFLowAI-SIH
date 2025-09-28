
import React, { useState } from 'react';
import { User } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, ShieldOff, Ban, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserAdminTableProps {
  users: User[];
  onRefresh: () => Promise<void>;
}

const UserAdminTable: React.FC<UserAdminTableProps> = ({ users, onRefresh }) => {
  const { toggleUserAdmin, banUser } = useAdmin();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    setLoadingUserId(userId);
    try {
      await toggleUserAdmin(userId, isAdmin);
      await onRefresh();
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await banUser(userId);
      await onRefresh();
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.skills.slice(0, 3).map((skill, index) => (
                        <Badge variant="outline" key={index}>{skill}</Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge variant="outline">+{user.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-amber-500">Admin</Badge>
                    ) : user.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {loadingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(user.id, !user.isAdmin)}
                          title={user.isAdmin ? "Remove admin privileges" : "Make admin"}
                        >
                          {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={user.isBanned}
                              title="Ban user"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ban User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ban {user.name}? This will prevent them from accessing the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleBanUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Ban User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserAdminTable;
