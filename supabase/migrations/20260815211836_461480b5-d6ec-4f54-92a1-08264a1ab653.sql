REVOKE ALL ON FUNCTION public.admin_email_delete_message_batch(text,text,bigint[]) FROM anon;
REVOKE ALL ON FUNCTION public.admin_email_delete_message_batch(text,text,bigint[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_email_delete_message_batch(text,text,bigint[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_email_requeue_dlq_batch(text,bigint[]) FROM anon;
REVOKE ALL ON FUNCTION public.admin_email_requeue_dlq_batch(text,bigint[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_email_requeue_dlq_batch(text,bigint[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM anon;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;

REVOKE ALL ON FUNCTION public.email_queue_wake() FROM anon;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC;