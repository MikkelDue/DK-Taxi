<?php
global $theme_data;
if( is_wp_error( $theme_data ) ) :
	echo $theme_data->get_error_message();
else :
	$current_theme = get_option( 'template' );
	$config = onecom_themes_listing_config();
	

	//foreach ( $themes_data as $page_number_key => $theme_data ) :
		$themes = ( isset( $theme_data->collection ) && ! empty( $theme_data->collection ) ) ? $theme_data->collection : array();
		if( empty( $themes ) ) {
			return;
		}

        $themes = onecom_filter_hidden_themes($themes);

		?>
		<div id="theme-browser-page-filtered-<?php echo $theme_data->page_number; ?>" class="theme-browser-page theme-browser-page-filtered" data-page_number="<?php echo $theme_data->page_number; ?>">
		</div>
		<div id="theme-browser-page-<?php echo $theme_data->page_number; ?>" class="theme-browser-page" data-page_number="<?php echo $theme_data->page_number; ?>">
		<?php
		$themes = array_reverse(array_reverse($themes));
		foreach ($themes as $key => $theme) :
			$is_installed = onecom_is_theme_installed( $theme->slug );
			$tags = $theme->tags;
			$tags = implode( ' ', $tags );
			$hidden_class = $key > ($config['item_count'] -1) ? 'hidden_theme' : '';

			$page_class = ceil(($key+1)/$config['item_count']);
			$is_premium = ((is_array($theme->tags) && in_array('premium', $theme->tags)) ? 1 : 0);
			?>
				<div data-index="<?php echo $key+1?>" data-is-premium="<?php echo (int)$is_premium; ?>" class="one-theme theme scale-anm <?php echo $tags; ?> page-<?php echo $page_class;?> <?php echo $hidden_class;?> all <?php echo ( $is_installed ) ? 'installed' : ''; ?>">
					<div class="theme-screenshot">
						<?php
							$thumbnail_url = $theme->thumbnail;
							$thumbnail_url = preg_replace( '#^https?:#', '', $thumbnail_url );
						?>
							<img src="<?php echo $thumbnail_url; ?>" alt="<?php echo $theme->name; ?>" />
					</div>
					<?php apply_filters('onecom_premium_theme_badge', $theme->tags); ?>
					<div class="theme-overlay">
						<h4>
							<?php echo $theme->name; ?>
							<!-- <span>
								<?php //echo wp_trim_words( $theme->description, 15 ); ?>
								<a href="<?php //echo MIDDLEWARE_URL; ?>/themes/<?php //echo $theme->slug; ?>/info/?TB_iframe=true&amp;width=1200&amp;height=800" title="<?php //echo __( 'More information of', OC_PLUGIN_DOMAIN ).' '.$theme->name; ?>" class="thickbox"><?php //_e( 'Read more', OC_PLUGIN_DOMAIN ); ?></a>
							</span> -->
						</h4>
						<div class="theme-action">
							<div class="one-preview">
								<a class="preview_link" id="demo-<?php echo $key+1?>" data-id="<?php echo $key+1?>" data-demo-url="<?php echo $theme->preview; ?>">
	                                    <span class="dashicons dashicons-search"></span>
	                                    <span>
	                                        <?php _e( 'Preview', OC_PLUGIN_DOMAIN ); ?>
	                                    </span>
	                            </a>
							</div>
							<?php $class = ( $is_installed ) ? 'one-installed' : 'one-install'; ?>
							<?php $action = ( $is_installed ) ? 'onecom_activate_theme' : 'onecom_install_theme'; ?>
							<?php
								if( $is_installed & ( $current_theme == $theme->slug ) ) {
									$action = '';
								}
							?>
							<?php
								if( $theme->redirect != '' ) {
									$theme->redirect = add_query_arg( array(
										'auto-import' => true
									), $theme->redirect );
								}
								$classNew = '';
                                if ($current_theme == $theme->slug) {
                                    $classNew = 'current_active_theme';

                                }
            ?>
							<div class="<?php echo $class; ?> <?php echo $classNew;?>" data-theme_slug="<?php echo $theme->slug; ?>" data-name="<?php echo $action ?>" data-redirect="<?php echo $theme->redirect; ?>">
								<span>
									<span class="dashicons dashicons-yes"></span>
									<?php if( $is_installed && ( $current_theme == $theme->slug ) ) : ?>
										<span class="action-text"><?php _e( 'Active', OC_PLUGIN_DOMAIN ); ?></span>
									<?php elseif( $is_installed && ( $current_theme != $theme->slug ) ) : ?>
										<?php
											$activate_url = add_query_arg( array(
												'action'     => 'activate',
												'_wpnonce'   => wp_create_nonce( 'switch-theme_' . $theme->slug ),
												'stylesheet' => $theme->slug,
											), admin_url( 'themes.php' ) );
										?>
										<?php if( ( ! isset( $theme->redirect ) ) || $theme->redirect != '' ) : ?>
											<span class="action-text one-activate-theme"><?php _e( 'Activate', OC_PLUGIN_DOMAIN ); ?></span>
										<?php else: ?>
											<a href="<?php echo $activate_url ?>"><?php _e( 'Activate', OC_PLUGIN_DOMAIN ) ?></a>
										<?php endif; ?>
									<?php else : ?>
										<span class="action-text"><?php _e( 'Install', OC_PLUGIN_DOMAIN ); ?></span>
									<?php endif; ?>
								</span>
							</div>
						</div>
					</div>
                    <?php if(true === onecom_checkdate_timestamp($theme->new)){ ?>
                        <div class="oc-new-ribbon">
                            <span class="oc-new-ribbon-text"><?php echo __("New", OC_PLUGIN_DOMAIN); ?></span>
                        </div>
                    <?php } ?>
				</div>
			<?php
		endforeach;
		?>
		</div><!-- theme-browser-page -->
		<?php
	//endforeach;
endif;
?>
