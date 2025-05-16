CREATE TABLE `plan_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`plan` varchar(50) NOT NULL,
	`link` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plan_table_id` PRIMARY KEY(`id`)
);
