import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteFormButtonProps {
  formId: string;
  formTitle: string;
  onDelete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function DeleteFormButton({ 
  formId, 
  formTitle, 
  onDelete, 
  size = 'sm',
  variant = 'outline' 
}: DeleteFormButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First delete the form table if it exists
      const { error: tableError } = await supabase
        .rpc('delete_form_table', { form_id: formId });

      if (tableError) {
        console.warn('Error deleting form table:', tableError);
        // Continue with form deletion even if table deletion fails
      }

      // Then delete the form
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Form deleted successfully"
      });

      onDelete?.();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Error deleting form",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={size} variant={variant} disabled={isDeleting}>
          <Trash className="w-3 h-3 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the form <strong>"{formTitle}"</strong>?
            <br /><br />
            This action cannot be undone. All data and responses associated with this form will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}