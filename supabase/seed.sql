-- NDT: Seed Data — 10 Funny Proverbs from Around the World
-- NOTE: Run this AFTER creating a test user in Supabase Auth.
-- Replace the user_id below with your test user's UUID.

-- Create a seed profile (you can also just sign up via the app)
-- INSERT INTO public.profiles (id, display_name) VALUES ('YOUR-USER-UUID', 'Seed User');

-- For demo purposes, we use a placeholder UUID.
-- Replace 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' with a real user UUID.

do $$
declare
  seed_user_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
begin

-- 1. Turkish
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'TR', 'Europe', 'Turkish',
  'Nah demis devede cicegi',
  'The camel said "nah" to the flower',
  'Someone who pretends to be modest but is actually boasting',
  42)
returning id into p1;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p1, 'Someone who pretends to be modest but is actually boasting', true, 0),
  (p1, 'A stubborn person who refuses gifts', false, 1),
  (p1, 'Nature always finds a way', false, 2),
  (p1, 'Being ungrateful for what you have', false, 3);

-- 2. Japanese
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'JP', 'East Asia', 'Japanese',
  '猿も木から落ちる (Saru mo ki kara ochiru)',
  'Even monkeys fall from trees',
  'Even experts make mistakes sometimes',
  38)
returning id into p2;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p2, 'Even experts make mistakes sometimes', true, 0),
  (p2, 'Don''t try things above your skill level', false, 1),
  (p2, 'What goes up must come down', false, 2),
  (p2, 'Be careful in high places', false, 3);

-- 3. German
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'DE', 'Europe', 'German',
  'Ich verstehe nur Bahnhof',
  'I only understand train station',
  'I don''t understand anything you''re saying',
  35)
returning id into p3;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p3, 'I don''t understand anything you''re saying', true, 0),
  (p3, 'I want to leave / go home', false, 1),
  (p3, 'Life is a journey', false, 2),
  (p3, 'I''m lost and confused', false, 3);

-- 4. Russian
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'RU', 'Europe', 'Russian',
  'Не мое собачье дело (Ne moyo sobach''ye delo)',
  'It''s not my dog''s business',
  'It''s none of my concern / not my problem',
  31)
returning id into p4;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p4, 'It''s none of my concern / not my problem', true, 0),
  (p4, 'Dogs are better left alone', false, 1),
  (p4, 'Mind your own business', false, 2),
  (p4, 'Don''t meddle in others'' affairs', false, 3);

-- 5. Thai
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'TH', 'Southeast Asia', 'Thai',
  'ไก่เห็นตีนงู งูเห็นนมไก่',
  'The chicken sees the snake''s feet, the snake sees the chicken''s breasts',
  'Two people who know each other''s secrets',
  28)
returning id into p5;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p5, 'Two people who know each other''s secrets', true, 0),
  (p5, 'Enemies who understand each other well', false, 1),
  (p5, 'Things are not what they seem', false, 2),
  (p5, 'Everyone has hidden talents', false, 3);

-- 6. Spanish
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'ES', 'Europe', 'Spanish',
  'No hay burro calvo',
  'There is no bald donkey',
  'Everyone has at least one good quality',
  25)
returning id into p6;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p6, 'Everyone has at least one good quality', true, 0),
  (p6, 'Some things are impossible', false, 1),
  (p6, 'Don''t judge by appearances', false, 2),
  (p6, 'Vanity is pointless', false, 3);

-- 7. Swedish
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'SE', 'Europe', 'Swedish',
  'Det finns ingen ko på isen',
  'There is no cow on the ice',
  'There''s nothing to worry about / no danger',
  22)
returning id into p7;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p7, 'There''s nothing to worry about / no danger', true, 0),
  (p7, 'The situation is slippery/risky', false, 1),
  (p7, 'Don''t put yourself in a bad position', false, 2),
  (p7, 'Something is missing from the picture', false, 3);

-- 8. Arabic
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'SA', 'Middle East', 'Arabic',
  'القرد بعين أمه غزال',
  'A monkey in its mother''s eye is a gazelle',
  'A mother always sees her child as beautiful',
  19)
returning id into p8;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p8, 'A mother always sees her child as beautiful', true, 0),
  (p8, 'Beauty is in the eye of the beholder', false, 1),
  (p8, 'Looks can be deceiving', false, 2),
  (p8, 'Don''t compare yourself to others', false, 3);

-- 9. Finnish
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'FI', 'Europe', 'Finnish',
  'Ei kannata mennä merta edemmäs kalaan',
  'Don''t go further than the sea to fish',
  'Don''t overcomplicate things when the solution is right in front of you',
  16)
returning id into p9;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p9, 'Don''t overcomplicate things when the solution is right in front of you', true, 0),
  (p9, 'Know your limits', false, 1),
  (p9, 'The journey matters more than the destination', false, 2),
  (p9, 'Stick to what you know', false, 3);

-- 10. Korean
insert into public.proverbs (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
values (gen_random_uuid(), seed_user_id, 'KR', 'East Asia', 'Korean',
  '똥 묻은 개가 겨 묻은 개 나무란다',
  'The dog with poop on it scolds the dog with chaff on it',
  'Someone guilty of worse faults criticizing others for lesser ones',
  13)
returning id into p10;

insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
  (p10, 'Someone guilty of worse faults criticizing others for lesser ones', true, 0),
  (p10, 'Don''t point fingers when you''re not perfect', false, 1),
  (p10, 'Dirty people shouldn''t judge cleanliness', false, 2),
  (p10, 'Everyone has their own problems', false, 3);

end $$;
