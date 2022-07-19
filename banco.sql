create table usuarios (
    login varchar(50) primary key not null,
	senha varchar(50) not null
);

insert into usuarios (login, senha) values ('pedro', 1234), ('bob', 1234);
