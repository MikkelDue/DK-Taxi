<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'mikkelbjoernsholm_onewordpress' );

/** Database username */
define( 'DB_USER', 'mikkelbjoernsholm_onewordpress' );

/** Database password */
define( 'DB_PASSWORD', 'mg!EppcT-A7KSPTskws9' );

/** Database hostname */
define( 'DB_HOST', 'mikkelbjoernsholm.one.mysql.service.one.com' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '2tASP7Fg_EthExYcA4b5CwCyWIsP3z-XS9ZUANTQh04=' );
define( 'SECURE_AUTH_KEY',  'ieq7EW4vSFdOFJlQCDaLhKEAcalmBVUewgBwHclzz2A=' );
define( 'LOGGED_IN_KEY',    'Si6IC-HOKhdDCM8p1sBfRNR4Gc7iAPYMMFYEoqZnm6Y=' );
define( 'NONCE_KEY',        'SfuRDcDrgKCAoQKu0Mvip1plRDCmUMc4ISpIqP2EKRE=' );
define( 'AUTH_SALT',        'XqQjuK4hv1PqgUnf1RHT-2rCOdmZW9xaUmW3CMkAhko=' );
define( 'SECURE_AUTH_SALT', 'Kfd2ZcV7ftJ45zNX8Sf-Pu402CAZfG5VraOjH7VK8Zs=' );
define( 'LOGGED_IN_SALT',   'jHsb3t26RuMF2yGQaVPoV2aBEQm_eSV2C4Ti_c3QoBY=' );
define( 'NONCE_SALT',       'UbNwg0ogj1GMv7rvz1sYPbetc6bIFo8sEQutEDtVRbg=' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'www_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define( 'WPLANG', 'en_GB' );

/**
 * Get email from control email
 *
 * Just set to default email fields during 1-click installation
 */
define( 'WPEMAIL', '' );

/**
 * Prevent file editing from WP admin.
 * Just set to false if you want to edit templates and plugins from WP admin.
 */
define('DISALLOW_FILE_EDIT', true);

/**
 * API for One.com wordpress themes and plugins
 */
define('ONECOM_WP_ADDONS_API', 'https://wpapi.one.com');

/**
 * Client IP for One.com logs
 */
if (getenv('HTTP_CLIENT_IP')){$_SERVER['ONECOM_CLIENT_IP'] = @getenv('HTTP_CLIENT_IP');}
else if(getenv('REMOTE_ADDR')){$_SERVER['ONECOM_CLIENT_IP'] = @getenv('REMOTE_ADDR');}
else{$_SERVER['ONECOM_CLIENT_IP']='0.0.0.0';}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';