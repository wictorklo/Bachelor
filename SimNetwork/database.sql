CREATE DATABASE IF NOT EXISTS Bachelor DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE Bachelor;

CREATE TABLE IF NOT EXISTS accounts (
  id int(11) NOT NULL,
  email varchar(50) NOT NULL,
  password varchar(255) NOT NULL,
  address varchar(43) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO accounts (id, email, password, address) VALUES (1, 'test@test.com', 'test', '0x1234');

ALTER TABLE accounts ADD PRIMARY KEY (id); ALTER TABLE accounts MODIFY id int(11) NOT NULL
AUTO_INCREMENT,AUTO_INCREMENT=2;

INSERT INTO accounts (email, password, address) VALUES ('abc', '$2b$05$k11yXhOY5vZNfXHHSOOoSOc8vr398uBFUrDZ9s1Ag1pwdxnsbzMTi', '0x91dDFdB4BD66427eCDB4025f987E0FC682A487EB');
INSERT INTO accounts (email, password, address) VALUES ('admin', '$2b$05$9XyHJzyxAbUYVCzP9sHtG.GJBfKq.VX.2LvTzLvIKyq0pIFh2MpQq', '0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2');