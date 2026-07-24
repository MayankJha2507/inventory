-- Allow the reason-tagged inventory history types introduced with explicit
-- sale recording (defective / lost / recount). Run once in the Supabase SQL
-- editor if your database was created before this change.

alter table inventory_history
  drop constraint if exists inventory_history_type_check;

alter table inventory_history
  add constraint inventory_history_type_check check (
    type in (
      'sale', 'restock', 'adjustment', 'created', 'defective', 'lost', 'recount'
    )
  );
