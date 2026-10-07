alter table classes add column if not exists weekdays int[];
alter table classes add column if not exists start_date date;
alter table classes add column if not exists end_date date;
update classes set weekdays = array[weekday] where weekdays is null and weekday is not null;
alter table classes drop column if exists weekday;
