CREATE TABLE IF NOT EXISTS `MSM_Ratings` (
  `id` int(11) NOT NULL,
  `ratings` int(11) NOT NULL DEFAULT '0',
  `casts` int(11) NOT NULL DEFAULT '0',
  `ip` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;