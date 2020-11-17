create table waiters(
    id serial primary key,
    waiters text not null
);

create table weekdays(
    id serial primary key,
    weekdays text not null
);

create table shifts(
    weekdays_name text not null,
    waiters_name text not null
);

insert into weekdays (weekdays) values ('sunday');
insert into weekdays (weekdays) values ('monday');
insert into weekdays (weekdays) values ('tuesday');
insert into weekdays (weekdays) values ('wednesday');
insert into weekdays (weekdays) values ('thursday');
insert into weekdays (weekdays) values ('friday');
insert into weekdays (weekdays) values ('saturday');
