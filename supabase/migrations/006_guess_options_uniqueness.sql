-- Prevent duplicate guess options per proverb and sort slot
begin;

-- Keep the first row for each (proverb_id, sort_order), remove duplicates
with ranked as (
  select
    id,
    row_number() over (
      partition by proverb_id, sort_order
      order by id
    ) as rn
  from public.guess_options
)
delete from public.guess_options g
using ranked r
where g.id = r.id
  and r.rn > 1;

-- One option per position in a proverb quiz
create unique index if not exists idx_guess_options_proverb_sort_unique
  on public.guess_options (proverb_id, sort_order);

-- Ensure there is at most one correct option per proverb
create unique index if not exists idx_guess_options_one_correct_per_proverb
  on public.guess_options (proverb_id)
  where is_correct;

-- Guard expected sort range used by the app
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'guess_options_sort_order_range_check'
      AND conrelid = 'public.guess_options'::regclass
  ) THEN
    ALTER TABLE public.guess_options
      ADD CONSTRAINT guess_options_sort_order_range_check
      CHECK (sort_order BETWEEN 0 AND 3);
  END IF;
END
$$;

commit;
