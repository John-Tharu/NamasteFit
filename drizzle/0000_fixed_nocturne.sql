CREATE TABLE `payment_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`plan` varchar(255) NOT NULL,
	`amount` float NOT NULL,
	`txid` varchar(255) NOT NULL,
	`uId` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_table_txid_unique` UNIQUE(`txid`)
);
--> statement-breakpoint
CREATE TABLE `plan_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slogan` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`plan` varchar(50) NOT NULL,
	`link` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plan_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`pass` varchar(255) NOT NULL,
	`role` varchar(8) NOT NULL DEFAULT 'User',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_table_email_unique` UNIQUE(`email`)
);
