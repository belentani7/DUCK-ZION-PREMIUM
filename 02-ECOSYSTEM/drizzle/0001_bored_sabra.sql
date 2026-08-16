CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(255) NOT NULL,
	`details` text,
	`performedBy` varchar(255) NOT NULL DEFAULT 'Duck',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(64),
	`genre` varchar(64) NOT NULL,
	`status` enum('briefing','recording','mixing','mastering','delivered') NOT NULL DEFAULT 'briefing',
	`budget` decimal(10,2),
	`notes` text,
	`stemsUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`genre` varchar(64) NOT NULL,
	`credits` varchar(255) NOT NULL,
	`bpm` int,
	`duration` varchar(32),
	`audioUrl` text,
	`coverUrl` text,
	`isSingle` int NOT NULL DEFAULT 0,
	`status` varchar(64) NOT NULL DEFAULT 'released',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
