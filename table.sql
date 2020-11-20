drop table if exists dayShifts, waiterDB, weekdays;

create table waiterDB(
id serial not null primary key,
username text not null,
full_name text not null,
position text not null
);

CREATE TABLE weekdays(
 id serial not null PRIMARY KEY ,
  dayName  VARCHAR(20) UNIQUE 
);

CREATE TABLE dayShifts(
id serial not NULL PRIMARY key,
waiter_id  int not null,
weekday_id int not null ,
foreign key (waiter_id) references waiterDB(id),
foreign key (weekday_id) references weekdays(id)
);

-- --  INSERT data into waiter

INSERT INTO waiterDB (username,full_name,position) VALUES ('Stylez','Yongama','waiter');
INSERT INTO waiterDB (username,full_name,position) VALUES ('General','Avongile','waiter');
INSERT INTO waiterDB (username,full_name,position) VALUES ('Sheriff','Vusi','waiter');
INSERT INTO waiterDB (username,full_name,position) VALUES ('Ngamla','Akhona','waiter');


-- -- INSERT WEEKDAYS
INSERT INTO weekdays (dayName) VALUES ('Sunday');
INSERT INTO weekdays (dayName) VALUES ('Monday');
INSERT INTO weekdays (dayName) VALUES ('Tuesday');
INSERT INTO weekdays (dayName) VALUES ('Wednesday');
INSERT INTO weekdays (dayName) VALUES ('Thursday');
INSERT INTO weekdays (dayName) VALUES ('Friday');
INSERT INTO weekdays (dayName) VALUES ('Saturday');

-- selcting a shift
INSERT INTO dayShifts (waiter_id,weekday_id) VALUES(1,1);
INSERT INTO dayShifts (waiter_id,weekday_id) VALUES(1,2);
INSERT INTO dayShifts (waiter_id,weekday_id) VALUES(1,3);
INSERT INTO dayShifts (waiter_id,weekday_id) VALUES(1,7);
















-- create table waiters(
--     id serial primary key,
--     waiters text not null
-- );

-- create table weekdays(
--     id serial primary key,
--     weekdays text not null
-- );

-- create table shifts(
--     weekdays_name text not null,
--     waiters_name text not null
-- );

-- insert into weekdays (weekdays) values ('sunday');
-- insert into weekdays (weekdays) values ('monday');
-- insert into weekdays (weekdays) values ('tuesday');
-- insert into weekdays (weekdays) values ('wednesday');
-- insert into weekdays (weekdays) values ('thursday');
-- insert into weekdays (weekdays) values ('friday');
-- insert into weekdays (weekdays) values ('saturday');
