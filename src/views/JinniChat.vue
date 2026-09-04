<template xmlns="http://www.w3.org/1999/html">
  <div class="genie-chat-container" :class="currentTheme">
    <!-- iOS keyboard gap filler: covers the strip between the shrunk chat
         shell and the keyboard in the page's own bottom tone (see the
         visualViewport handler in mounted). Hidden whenever kbStripTop is 0. -->
    <div v-if="kbStripTop" class="kb-strip" :style="{ top: kbStripTop + 'px' }" aria-hidden="true"></div>
    <SwitchModeOverlay :visible="isSwitching" :label="t('chat.switch_mode.switching')" :theme="currentTheme === 'night-mode' ? 'dark' : 'light'" />
    <div v-if="mobileSidebarOpen && !isDesktop" class="sidebar-overlay" @click="handleOverlayClick"></div>
    <div class="sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen, 'sidebar-open': mobileSidebarOpen }" ref="sidebar">
      <div class="app-header">
        <div v-if="sidebarOpen || mobileSidebarOpen" class="app-brand">
          <img src="/images/bottle.png?v=3" class="app-icon" alt="Jinni">
          <span class="app-name">{{ t('chat.sidebar.app_name') }}</span>
          <button @click="toggleSidebar" class="collapse-btn collapse-btn-inline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
        <div v-else class="app-brand-collapsed">
          <img src="/images/bottle.png?v=3" class="app-icon-collapsed" alt="Jinni">
        </div>
      </div>

      <div class="sidebar-header">
        <button v-if="sidebarOpen || mobileSidebarOpen" @click="startNewChat" class="new-chat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          {{ t('chat.sidebar.new_chat') }}
        </button>
        <button
          v-if="sidebarOpen || mobileSidebarOpen"
          @click="openSavedPlaces"
          class="saved-places-nav-btn"
          :title="t('chat.sidebar.saved_places')"
          :aria-label="t('chat.sidebar.saved_places')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button v-if="!sidebarOpen && isDesktop" @click="startNewChat" class="new-chat-btn-collapsed">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button v-if="!sidebarOpen && isDesktop" @click="toggleSidebar" class="collapse-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div class="chat-history">
        <div v-if="loadingSessions" class="loading-sessions">
          <span>{{ t('chat.sidebar.loading_conversations') }}</span>
        </div>
        <div v-for="session in sortedSessions" :key="session.id" class="session-item" :class="{ 'active': activeSessionId === session.id }" @click="loadChatSession(session.id)" @contextmenu.prevent="openContextMenu(session, $event)">
          <div class="session-header">
            <div class="session-title">
              <input v-if="editingSessionId === session.id" v-model="session.title" @keyup.enter="saveSessionTitle(session)" @blur="saveSessionTitle(session)"  @click.stop class="title-input" ref="titleInput">
              <span v-else>{{ session.title ? displayTitle(session.title) : t('chat.sidebar.default_chat_title', { number: index + 1 }) }}</span>
            </div>
            <div class="session-actions">
              <button v-if="contextMenu.sessionId !== session.id" @click.stop="toggleContextMenu(session, $event)" class="icon-btn" :aria-label="t('chat.sidebar.session_options')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
              </button>
              <div v-else class="session-actions-inline">
                <button @click.stop="toggleEditSession(session)" class="session-act-btn" :title="t('chat.context_menu.rename')" :aria-label="t('chat.context_menu.rename')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                </button>
                <button @click.stop="deleteSession(session.id)" class="session-act-btn session-act-btn--del" :title="t('chat.context_menu.delete')" :aria-label="t('chat.context_menu.delete')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <button @click.stop="closeContextMenu()" class="session-act-btn" :title="t('common.close')" :aria-label="t('common.close')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="session-date">
            {{ formatRelativeTime(session.updatedAt || session.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Switch to Listing — only for users who own a business -->
      <div v-if="(sidebarOpen || mobileSidebarOpen) && userBusinessId" class="switch-mode-wrapper">
        <button @click="switchToListing" class="switch-mode-btn">
          <span class="switch-mode-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="switch-mode-label">{{ t('chat.switch_mode.button') }}</span>
        </button>
      </div>

      <div v-if="sidebarOpen || mobileSidebarOpen || (!sidebarOpen && isDesktop)" class="sidebar-footer">
        <button @click="toggleProfileMenu" class="profile-btn" :class="{ 'profile-btn-collapsed': !sidebarOpen }">
          <div v-if="sidebarOpen" class="profile-expanded">
            <div v-if="userAvatar" class="avatar-container">
              <img :src="userAvatar" class="avatar" alt="Profile">
            </div>
            <div v-else class="default-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="profile-name">{{ userName }}</span>
          </div>
          <div v-else class="profile-collapsed">
            <div v-if="userAvatar" class="avatar-container">
              <img :src="userAvatar" class="avatar" alt="Profile">
            </div>
            <div v-else class="default-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </button>
        <transition name="profile-menu">
          <div v-if="showProfileMenu" class="profile-menu" :class="{ 'profile-menu-collapsed': !sidebarOpen }" v-click-outside="closeProfileMenu" @click.stop>
            <button @click="showProfile" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.profile') }}</span>
            </button>
            <button @click="showPreferences" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h4l3 9 4-18 3 9h4"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.preferences') }}</span>
            </button>
            <button @click="goToExplore" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.explore') || "Jinni's Discoveries" }}</span>
            </button>
            <button @click="showSettings" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.settings') }}</span>
            </button>
            <button @click="goToContactUs" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.contact_us') }}</span>
            </button>
            <button @click="logout" class="profile-menu-item logout-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span v-if="sidebarOpen">{{ t('chat.profile.logout') }}</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <div class="scroll-container" ref="scrollContainer">

      <div class="fixed-header" :class="{ 'with-shadow': messages.length > 0 }">
        <div class="centered-content">
          <div class="chat-header">
            <div v-if="!isDesktop" class="mobile-nav">
              <button @click="toggleSidebar" class="mobile-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="4" y1="8" x2="20" y2="8"/>
                  <line x1="4" y1="16" x2="14" y2="16"/>
                </svg>
              </button>
            </div>
            <div class="current-session-title" v-if="messages.length !== 0">
              {{ displayTitle(activeSession?.title) }}
            </div>
            <div v-if="!isDesktop && messages.length !== 0" class="mobile-new-chat">
              <button @click="startNewChat" class="mobile-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="scrollable-content" :class="{ 'chat-empty': messages.length === 0 }">
        <div class="centered-content">

          <div class="main-chat-area" ref="mainChatArea">
            <div class="chat-messages" ref="chatMessages">
              <div v-for="(message, index) in messages" :key="message.id || index" v-show="!message.hidden" :class="['message-bubble', message.sender, { 'touched': touchedMessageId === (message.id || index), 'msg-complete': !message.streaming }]" @touchstart="message.sender === 'user' && (touchedMessageId = (message.id || index))" @touchend.passive="true">
                <div class="content">
                  <!-- ============= STREAMING MODE ============= -->
                  <template v-if="message.streaming || streamingLampAnimatingIds.has(message.id)">
<!-- The lamp and what it is busy with, on ONE line: the note reads as
                         the lamp's own voice beside it, not as a caption under it. -->
                    <div class="streaming-lamp-row">
                      <AnimatedLamp :isLoading="message.streaming && !message.currentText && !message.textSections?.length && !message.recommendations?.length" class="streaming-lamp" :theme="resolveTheme()"/>
                      <div v-if="message.streaming && engineStage && !message.currentText" class="engine-stage">{{ engineStage }}</div>
                    </div>
                    <!-- Render interleaved structure -->
                    <template v-if="(message.textSections || message.recommendations) && message.isChatRecommendation">
                      <!-- Loop through all positions -->
                      <template v-for="position in getPositionRange(message)" :key="`pos-${position}`">
                        <!-- Text section (only if has content) -->
                        <div v-if="getTextAtPosition(message, position)" class="text message-text streaming-text">
                          <div v-html="formatTextSegment(getTextAtPosition(message, position))"></div>
                        </div>
                        <!-- Recommendation at this position -->
                        <div v-if="getRecommendationAtPosition(message, position)" class="inline-recommendation-wrapper">
                          <div :class="['rec-card-wrapper', getPartnerWrapperClass(getRecommendationAtPosition(message, position))]">
                          <div class="recommendation-card" :class="{ 'large-card': message.isChatRecommendation }">
                          <!-- Store rec in variable for cleaner template -->
                            <template v-if="getRecommendationAtPosition(message, position).image">
                              <div class="rec-image">
                                <img :src="getImageUrl(getRecommendationAtPosition(message, position).image)" :alt="getRecommendationAtPosition(message, position).name" @error="handleImageError" loading="lazy">
                                  <div class="image-overlay">
                                    <div class="overlay-actions">
                                      <button @click.stop="showPlaceInfo(getRecommendationAtPosition(message, position))" class="text-action-btn info-btn":disabled="isOnCooldown":class="{ 'disabled-cooldown': isOnCooldown }">
                                        {{ t('chat.recommendations.more') }}
                                      </button>
                                      <button @click.stop="handleRecommendationClick(getRecommendationAtPosition(message, position))" class="text-action-btn ask-btn":disabled="isOnCooldown">
                                        {{ t('chat.recommendations.ask_ai') }}
                                      </button>
                                    </div>
                                  </div>
                                  <button @click.stop="toggleSave(getRecommendationAtPosition(message, position), $event)" @touchstart.stop="() => {}" class="rec-image-save-btn" :class="{ saved: isSaved(getRecommendationAtPosition(message, position)) }" :title="isSaved(getRecommendationAtPosition(message, position)) ? t('chat.saved.remove_saved') : t('chat.saved.save_place')" :disabled="!getRecRef(getRecommendationAtPosition(message, position))">
                                    <svg v-if="isSaved(getRecommendationAtPosition(message, position))" width="24" height="90" viewBox="0 0 24 90" fill="url(#saveGradient)" stroke="none">
                                      <defs>
                                        <linearGradient id="saveGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stop-color="rgb(212,175,55)"/>
                                          <stop offset="100%" stop-color="rgb(255,140,0)"/>
                                        </linearGradient>
                                      </defs>
                                      <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                    </svg>
                                    <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                                  </button>
                              </div>
                            </template>
                            <template v-else>
                              <div class="rec-image loading-skeleton">
                                <div class="skeleton-shimmer"></div>
                              </div>
                            </template>
                            <div class="rec-details">
                              <div class="rec-header">
                                <div class="rec-name">{{ getRecommendationAtPosition(message, position).name }}</div>
                                <button @click.stop="requestImages(getRecommendationAtPosition(message, position))"class="image-request-btn":class="{ 'loading': getButtonState(getRecommendationAtPosition(message, position)) === 'loading' }":disabled="isButtonDisabled(getRecommendationAtPosition(message, position)) || isOnCooldown">
                                  <svg v-if="getButtonState(getRecommendationAtPosition(message, position)) !== 'loading'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21,15 16,10 5,21"/>
                                  </svg>
                                  <svg v-else class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                  </svg>
                                </button>
                              </div>
                              <div class="rec-type">
                                <span>{{ getRecommendationAtPosition(message, position).category || getRecommendationAtPosition(message, position).type }}</span>
                              </div>
                              <!-- Event date/time row (events only).
                                   Sits directly under the category so the date
                                   reads as the event's primary fact. -->
                              <div v-if="isEventRec(getRecommendationAtPosition(message, position)) && formatEventScheduleCard(getRecommendationAtPosition(message, position))" class="rec-event-schedule">
                                <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <div class="rec-event-schedule-text">
                                  <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(getRecommendationAtPosition(message, position)).primary }}</span>
                                  <span v-if="formatEventScheduleCard(getRecommendationAtPosition(message, position)).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(getRecommendationAtPosition(message, position)).secondary }}</span>
                                </div>
                                <span v-if="getRecommendationAtPosition(message, position)._isExpired" class="rec-event-ended">{{ t('chat.event.ended') }}</span>
                              </div>
                              <div v-if="getRecommendationAtPosition(message, position).description" class="rec-description">
                                {{ getRecommendationAtPosition(message, position).description }}
                              </div>
                              <div class="rec-metadata">
                                <div v-if="getRecommendationAtPosition(message, position).distance" class="rec-distance">
                                  {{ getRecommendationAtPosition(message, position).distance }}
                                </div>
                                <div v-if="getRecommendationAtPosition(message, position).address || getRecommendationAtPosition(message, position).location" class="rec-location">
                                  {{ getRecommendationAtPosition(message, position).address || getRecommendationAtPosition(message, position).location }}
                                </div>
                              </div>
                            </div>
                          </div><!-- /recommendation-card -->
                          <div class="rec-card-bottom">
                            <div v-if="(getRecommendationAtPosition(message, position).verifiedId || getRecommendationAtPosition(message, position).id?.startsWith('db-')) && getRecommendationAtPosition(message, position)._verifiedModel !== 'destination'" :class="['partner-label', getPartnerLabelClass(getRecommendationAtPosition(message, position))]" v-html="getPartnerIcon(getRecommendationAtPosition(message, position)) + ' ' + getPartnerLabel(getRecommendationAtPosition(message, position))"></div>
                            <a v-if="getRecommendationAtPosition(message, position).sourceUrl" :href="getRecommendationAtPosition(message, position).sourceUrl" target="_blank" rel="noopener noreferrer" class="rec-event-source rec-event-source--below" @click.stop>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                              <span>{{ t('chat.event.check_listing') || 'Check listing' }}</span>
                            </a>
                            <div class="rec-card-footer">
                              <div class="rec-footer-actions">
                                <button @click.stop="toggleRecFeedback(getRecommendationAtPosition(message, position), 'like', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(getRecommendationAtPosition(message, position)) === 'like' }" :title="t('chat.feedback.like')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                </button>
                                <button @click.stop="toggleRecFeedback(getRecommendationAtPosition(message, position), 'dislike', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(getRecommendationAtPosition(message, position)) === 'dislike' }" :title="t('chat.feedback.dislike')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                                </button>
                                <button v-if="!isDesktop" @click="shareRecommendation(getRecommendationAtPosition(message, position), $event)" class="feedback-btn rec-footer-btn" :class="{ active: sharedRecId && sharedRecId === (getRecommendationAtPosition(message, position).verifiedId || getRecommendationAtPosition(message, position).id || getRecommendationAtPosition(message, position).name) }" :title="sharedRecId && sharedRecId === (getRecommendationAtPosition(message, position).verifiedId || getRecommendationAtPosition(message, position).id || getRecommendationAtPosition(message, position).name) ? t('chat.feedback.copied') : t('chat.feedback.share')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg>
                                </button>
                              </div>
                            </div><!-- /rec-card-footer -->
                          </div><!-- /rec-card-bottom -->
                          </div><!-- /rec-card-wrapper -->
                        </div><!-- /inline-recommendation-wrapper -->
                      </template>
                      <!-- Current text being typed (after last recommendation) -->
                      <div v-if="message.currentText" class="text message-text streaming-text">
                        <div v-html="formatTextSegment(message.currentText)"></div>
                      </div>
                    </template>
                    <!-- Fallback: Just current text if no structure yet -->
                    <div v-else-if="message.currentText" class="text message-text streaming-text">
                      <div v-html="formatTextSegment(message.currentText)"></div>
                    </div>
                  </template>

                  <!-- ============= COMPLETED MODE (contentParts structure) ============= -->
                  <template v-else-if="!message.streaming && message.contentParts && message.contentParts.length > 0">
                    <template v-for="(part, partIndex) in message.contentParts" :key="`part-${partIndex}`">
                      <!-- Text parts -->
                      <div v-if="part.type === 'text'" class="text message-text">
                        <div v-html="formatTextSegment(part.content)"></div>
                      </div>
                      <!-- Recommendation cards (inline) -->
                      <div v-else-if="part.type === 'recommendation' && message.recommendations && message.recommendations[part.index] && !(message.metadata && message.metadata.routeTo)" class="inline-recommendation-wrapper">
                        <div :class="['rec-card-wrapper', getPartnerWrapperClass(message.recommendations[part.index])]">
                        <div class="recommendation-card inline-card" :class="{ 'large-card': message.isChatRecommendation }" @touchstart="handleCardTouchStart(message.recommendations[part.index], $event)" @touchend="handleCardTouchEnd(message.recommendations[part.index], $event)">
                          <div class="rec-image" v-if="message.recommendations[part.index].image">
                            <img :src="getImageUrl(message.recommendations[part.index].image)" :alt="message.recommendations[part.index].name" @error="handleImageError" loading="lazy">
                            <div class="image-overlay">
                              <div class="overlay-actions">
                                <button @click.stop="showPlaceInfo(message.recommendations[part.index])" class="text-action-btn info-btn":disabled="isOnCooldown">
                                  {{ t('chat.recommendations.more') }}
                                </button>
                                <button @click.stop="handleRecommendationClick(message.recommendations[part.index])" class="text-action-btn ask-btn":disabled="isOnCooldown">
                                  {{ t('chat.recommendations.ask_ai') }}
                                </button>
                              </div>
                            </div>
                            <button @click.stop="toggleSave(message.recommendations[part.index], $event)" @touchstart.stop="() => {}" class="rec-image-save-btn" :class="{ saved: isSaved(message.recommendations[part.index]) }" :title="isSaved(message.recommendations[part.index]) ? t('chat.saved.remove_saved') : t('chat.saved.save_place')" :disabled="!getRecRef(message.recommendations[part.index])">
                              <svg v-if="isSaved(message.recommendations[part.index])" width="24" height="90" viewBox="0 0 24 90" fill="url(#saveGradient)" stroke="none">
                                <defs>
                                  <linearGradient id="saveGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="rgb(212,175,55)"/>
                                    <stop offset="100%" stop-color="rgb(255,140,0)"/>
                                  </linearGradient>
                                </defs>
                                <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                              </svg>
                              <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                            </button>
                          </div>
                          <div v-else class="rec-image-placeholder">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                          <div class="rec-details">
                            <div class="rec-header">
                              <div class="rec-name">{{ message.recommendations[part.index].name }}</div>
                              <button @click.stop="requestImages(message.recommendations[part.index])" class="image-request-btn" :class="{ 'loading': getButtonState(message.recommendations[part.index]) === 'loading' }" :disabled="isButtonDisabled(message.recommendations[part.index]) || isOnCooldown">
                                <svg v-if="getButtonState(message.recommendations[part.index]) !== 'loading'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21,15 16,10 5,21"/>
                                </svg>
                                <svg v-else class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                </svg>
                              </button>
                            </div>
                            <div class="rec-type">
                              <span>{{ message.recommendations[part.index].category || message.recommendations[part.index].type }}</span>
                            </div>
                            <!-- Event date/time row (events only). -->
                            <div v-if="isEventRec(message.recommendations[part.index]) && formatEventScheduleCard(message.recommendations[part.index])" class="rec-event-schedule">
                              <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              <div class="rec-event-schedule-text">
                                <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(message.recommendations[part.index]).primary }}</span>
                                <span v-if="formatEventScheduleCard(message.recommendations[part.index]).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(message.recommendations[part.index]).secondary }}</span>
                              </div>
                              <span v-if="message.recommendations[part.index]._isExpired" class="rec-event-ended">{{ t('chat.event.ended') }}</span>
                            </div>
                            <div v-if="message.recommendations[part.index].description" class="rec-description">
                              {{ message.recommendations[part.index].description }}
                            </div>
                            <div class="rec-metadata">
                              <div v-if="message.recommendations[part.index].distance" class="rec-distance">
                                {{ message.recommendations[part.index].distance }}
                              </div>
                              <div v-if="message.recommendations[part.index].address || message.recommendations[part.index].location" class="rec-location">
                                {{ message.recommendations[part.index].address || message.recommendations[part.index].location }}
                              </div>
                            </div>
                          </div>
                        </div><!-- /recommendation-card -->
                        <div class="rec-card-bottom">
                          <div v-if="(message.recommendations[part.index].verifiedId || message.recommendations[part.index].id?.startsWith('db-')) && message.recommendations[part.index]._verifiedModel !== 'destination'" :class="['partner-label', getPartnerLabelClass(message.recommendations[part.index])]" v-html="getPartnerIcon(message.recommendations[part.index]) + ' ' + getPartnerLabel(message.recommendations[part.index])"></div>
                          <a v-if="message.recommendations[part.index].sourceUrl" :href="message.recommendations[part.index].sourceUrl" target="_blank" rel="noopener noreferrer" class="rec-event-source rec-event-source--below" @click.stop>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            <span>{{ t('chat.event.check_listing') || 'Check listing' }}</span>
                          </a>
                          <div class="rec-card-footer">
                            <div class="rec-footer-actions">
                              <button @click.stop="toggleRecFeedback(message.recommendations[part.index], 'like', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(message.recommendations[part.index]) === 'like' }" :title="t('chat.feedback.like')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              </button>
                              <button @click.stop="toggleRecFeedback(message.recommendations[part.index], 'dislike', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(message.recommendations[part.index]) === 'dislike' }" :title="t('chat.feedback.dislike')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                              </button>
                              <button v-if="!isDesktop" @click="shareRecommendation(message.recommendations[part.index], $event)" class="feedback-btn rec-footer-btn" :class="{ active: sharedRecId && sharedRecId === (message.recommendations[part.index].verifiedId || message.recommendations[part.index].id || message.recommendations[part.index].name) }" :title="sharedRecId && sharedRecId === (message.recommendations[part.index].verifiedId || message.recommendations[part.index].id || message.recommendations[part.index].name) ? t('chat.feedback.copied') : t('chat.feedback.share')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg>
                              </button>
                            </div>
                          </div><!-- /rec-card-footer -->
                        </div><!-- /rec-card-bottom -->
                        </div><!-- /rec-card-wrapper -->
                      </div><!-- /inline-recommendation-wrapper -->
                    </template>
                    <button
                      v-if="!message.streaming && routeCtaFor(message)"
                      class="route-cta-btn"
                      type="button"
                      @click="openRouteFullscreen(message)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                      See route
                    </button>
                    <RecommendationMap
                      v-if="!message.streaming && message.recommendations && message.recommendations.length"
                      :route-only="!!(message.metadata && message.metadata.routeTo)"
                      :ref="el => registerRecMap(message.id, el)"
                      :recommendations="message.recommendations"
                      :theme="currentTheme"
                      v-bind="mapLabels"
                      @marker-click="onMapMarkerClick"
                      @view-details="showPlaceInfo"
                      @track="onMapTrack"
                    />
                  </template>

                  <!-- FALLBACK: Old messages with recommendations (quick actions) -->
                  <template v-else-if="message.recommendations && message.recommendations.length > 0">
                    <div v-if="message.text" class="text message-text" v-html="renderMessage(message.text, message)"></div>
                    <button
                      v-if="!message.streaming && routeCtaFor(message)"
                      class="route-cta-btn"
                      type="button"
                      @click="openRouteFullscreen(message)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                      See route
                    </button>
                    <div class="recommendations" :class="{'streaming-recommendations': message.streaming}">
                      <div v-if="!(message.metadata && message.metadata.routeTo)" class="section-title">
                        {{ message.isViewMore ? t('chat.recommendations.more_recommendations') : t('chat.recommendations.recommended') }}
                        <span v-if="message.recommendations.length > 0" class="results-count">
                          {{ t('chat.recommendations.results_count', { count: message.recommendations.length }) }}
                        </span>
                      </div>
                      <div v-if="!(message.metadata && message.metadata.routeTo)" class="recommendation-grid">
                        <div v-for="(rec, recIndex) in message.recommendations" :key="recIndex" :class="['rec-card-wrapper', getPartnerWrapperClass(rec)]">
                          <div class="recommendation-card" @touchstart="handleCardTouchStart(rec, $event)" @touchend="handleCardTouchEnd(rec, $event)">
                            <!-- An event with a date but no image is a DATE-CARD: the event
                                 is real and its schedule is real, but it has no Google
                                 place to take a photo from (a street festival has no venue
                                 photo). That is a FINAL state, not a pending one — so it
                                 gets a static event mark instead of the loading shimmer,
                                 which would otherwise animate forever and read as broken. -->
                            <div class="rec-image"
                                 :class="{
                                   'loading-skeleton': (rec.isStreaming || !rec.image) && !(!rec.image && !rec.isStreaming && rec.eventSchedule),
                                   'rec-image--event': !rec.image && !rec.isStreaming && rec.eventSchedule
                                 }">
                              <img v-if="rec.image" :src="getImageUrl(rec.image)" :alt="rec.name" @error="handleImageError" loading="lazy">
                              <div v-if="!rec.image && !rec.isStreaming && rec.eventSchedule" class="rec-image-event-mark">
                                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                              </div>
                              <div v-else-if="!rec.image" class="skeleton-shimmer"></div>
                              <div v-if="rec.image" class="image-overlay">
                                <div class="overlay-actions">
                                  <button @click.stop="showPlaceInfo(rec)" class="text-action-btn info-btn" :disabled="isOnCooldown" :class="{ 'disabled-cooldown': isOnCooldown }">
                                    {{ t('chat.recommendations.more') }}
                                  </button>
                                  <button @click.stop="handleRecommendationClick(rec)" class="text-action-btn ask-btn" :disabled="isOnCooldown" :class="{ 'disabled-cooldown': isOnCooldown }">
                                    {{ t('chat.recommendations.ask_ai') }}
                                  </button>
                                </div>
                              </div>
                              <button v-if="rec.image" @click.stop="toggleSave(rec, $event)" @touchstart.stop="() => {}" class="rec-image-save-btn" :class="{ saved: isSaved(rec) }" :title="isSaved(rec) ? t('chat.saved.remove_saved') : t('chat.saved.save_place')" :disabled="!getRecRef(rec)">
                                <svg v-if="isSaved(rec)" width="24" height="90" viewBox="0 0 24 90" fill="url(#saveGradient)" stroke="none">
                                  <defs>
                                    <linearGradient id="saveGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stop-color="rgb(212,175,55)"/>
                                      <stop offset="100%" stop-color="rgb(255,140,0)"/>
                                    </linearGradient>
                                  </defs>
                                  <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                                <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                              </button>
                            </div>
                            <div class="rec-details">
                              <div class="rec-header">
                                <div class="rec-name">{{ rec.name }}</div>
                                <button @click.stop="requestImages(rec)" class="image-request-btn" :class="{ 'loading': getButtonState(rec) === 'loading', 'disabled-cooldown': isOnCooldown }" :disabled="isButtonDisabled(rec) || isOnCooldown">
                                  <svg v-if="getButtonState(rec) !== 'loading'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21,15 16,10 5,21"/>
                                  </svg>
                                  <svg v-else class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                  </svg>
                                </button>
                              </div>
                              <!-- For events WITH a date, the schedule row below replaces the
                                   plain "Event" type (the date is the more useful label). -->
                              <div v-if="!(isEventRec(rec) && formatEventScheduleCard(rec))" class="rec-type">
                                <span>{{ rec.category || rec.type }}</span>
                              </div>
                              <!-- Event date/time row (events only) — shown in place of the type. -->
                              <div v-if="isEventRec(rec) && formatEventScheduleCard(rec)" class="rec-event-schedule">
                                <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <div class="rec-event-schedule-text">
                                  <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(rec).primary }}</span>
                                  <span v-if="formatEventScheduleCard(rec).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(rec).secondary }}</span>
                                </div>
                                <span v-if="rec._isExpired" class="rec-event-ended">{{ t('chat.event.ended') }}</span>
                              </div>
                              <div class="rec-metadata">
                                <div v-if="rec.distance && rec.distance !== 'Near you km'" class="rec-distance">
                                  {{ rec.distance }}
                                </div>
                                <div v-if="rec.address || rec.location" class="rec-location">
                                  {{ rec.address || rec.location || rec.region }}
                                </div>
                              </div>
                            </div>
                          </div><!-- /recommendation-card -->
                          <div class="rec-card-bottom">
                            <div v-if="(rec.verifiedId || rec.id?.startsWith('db-')) && rec._verifiedModel !== 'destination'" :class="['partner-label', getPartnerLabelClass(rec)]" v-html="getPartnerIcon(rec) + ' ' + getPartnerLabel(rec)"></div>
                            <!-- Event source ("Check listing") — placed BELOW the card like the
                                 partner badge, so it reads as a footnote to the whole card, not
                                 a line inside the details. Only when a validated http(s) URL exists. -->
                            <a v-if="rec.sourceUrl" :href="rec.sourceUrl" target="_blank" rel="noopener noreferrer" class="rec-event-source rec-event-source--below" @click.stop>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                              <span>{{ t('chat.event.check_listing') || 'Check listing' }}</span>
                            </a>
                            <div class="rec-card-footer">
                              <div class="rec-footer-actions">
                                <button @click.stop="toggleRecFeedback(rec, 'like', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(rec) === 'like' }" :title="t('chat.feedback.like')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                </button>
                                <button @click.stop="toggleRecFeedback(rec, 'dislike', $event, message)" class="feedback-btn rec-footer-btn" :class="{ active: getRecFeedback(rec) === 'dislike' }" :title="t('chat.feedback.dislike')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                                </button>
                                <button v-if="!isDesktop" @click="shareRecommendation(rec, $event)" class="feedback-btn rec-footer-btn" :class="{ active: sharedRecId && sharedRecId === (rec.verifiedId || rec.id || rec.name) }" :title="sharedRecId && sharedRecId === (rec.verifiedId || rec.id || rec.name) ? t('chat.feedback.copied') : t('chat.feedback.share')">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg>
                                </button>
                              </div>
                            </div><!-- /rec-card-footer -->
                          </div><!-- /rec-card-bottom -->
                        </div><!-- /rec-card-wrapper -->
                      </div><!-- /recommendation-grid -->
                      <RecommendationMap
                        :route-only="!!(message.metadata && message.metadata.routeTo)"
                        :ref="el => registerRecMap(message.id, el)"
                        :recommendations="message.recommendations"
                        :theme="currentTheme"
                        v-bind="mapLabels"
                        @marker-click="onMapMarkerClick"
                        @view-details="showPlaceInfo"
                        @track="onMapTrack"
                      />
                      <!-- VIEW MORE -->
                      <div v-if="shouldShowViewMore(message) && !message.streaming && !message.isLoadingMore && !viewMoreAnimatingIds.has(message.id)" class="view-more-container">
                        <button @click="handleViewMore(message)" class="view-more-btn" :disabled="isOnCooldown" :class="{ 'disabled-cooldown': isOnCooldown }" :title="`View More ${getActionLabel(message.actionType)}`">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                          {{ t('chat.recommendations.view_more', { type: getActionLabel(message.actionType) }) }}
                        </button>
                        <div class="view-more-hint" v-if="!isOnCooldown">
                          {{ getViewMoreHint(message) }}
                        </div>
                      </div>
                      <!-- LOADING MORE STATE -->
                      <div v-if="shouldShowViewMoreLoading(message)" class="view-more-loading">
                        <AnimatedLamp :isLoading="message.isLoadingMore" class="loading-more-lamp" :theme="resolveTheme()" />
                        <transition name="fade">
                          <span v-if="message.isLoadingMore" class="loading-more-text">
                            {{ t('chat.recommendations.loading_more', { type: getActionLabel(message.actionType).toLowerCase() }) }}
                          </span>
                        </transition>
                      </div>
                    </div>
                  </template>

                  <!-- ============= FALLBACK: Old messages - simple text ============= -->
                  <template v-else-if="message.text">
                    <div class="text message-text" v-html="renderMessage(message.text, message)"></div>
                  </template>

                  <!-- Quick Actions (if any) -->
                  <div v-if="message.quickActions && !message.streaming && message.sender === 'ai'" class="quick-actions">
                    <button v-for="(action, i) in message.quickActions" :key="i" @click="handleQuickAction(action)" class="action-chip">
                      {{ quickActionLabel(action) }}
                    </button>
                  </div>

                  <!-- Itinerary (generated trip plan). :request is nulled once
                       an id exists → a reload restores the saved trip from Mongo
                       instead of generating a new one. -->
                  <ItineraryView
                    v-if="message.itineraryRequest || message.itineraryId"
                    :ref="el => registerItineraryView(message.id, el)"
                    :request="message.itineraryId ? null : message.itineraryRequest"
                    :itinerary-id="message.itineraryId"
                    :theme="currentTheme"
                    :labels="itineraryLabels"
                    :locale="locale"
                    :map-labels="mapLabels"
                    :saved-keys="savedKeys"
                    @toggle-save="rec => toggleSave(rec)"
                    @created="(id, meta) => onItineraryCreated(message, id, meta)"
                    @view-place="rec => showPlaceInfo(rec)"
                    @ask-ai="rec => handleRecommendationClick(rec)"
                    @view-photos="onItineraryPhotos"
                    @usage-headers="applyUsageHeaders"
                    @generation-start="onItineraryStreamState(message, true)"
                    @generation-end="onItineraryStreamState(message, false)"
                    @hotel-choice="v => onItineraryHotelChoice(message, v)"
                  />
                  <!-- Generation lamp sits BELOW the itinerary (the top lamp
                       is for text streams; here the skeleton is the content).
                       Hidden while the hotel chooser is open — the lamp's dust
                       was covering the first hotel cards. -->
                  <!-- Kept mounted through itineraryLampExiting so the lamp can play its
                       exit (fade 0.5s → collapse at 1.5s over 1.2s) instead of being
                       unmounted in one frame — the other lamps are prop-driven and always
                       had this; the hardwired :isLoading="true" + v-if made this one
                       vanish instantly. Hotel-choosing still hides it instantly on
                       purpose (its dust would cover the first hotel cards). -->
                  <AnimatedLamp v-if="(message.itineraryStreaming || message.itineraryLampExiting) && !message.itineraryHotelChoosing" :isLoading="!!message.itineraryStreaming" class="streaming-lamp itin-lamp" :theme="resolveTheme()" />

                  <!-- Engine trace. It used to be appended to the prose, where it
                       read as something Jinni was saying; it belongs at the
                       bottom, dim, after everything the traveler actually asked
                       for. -->
                  <div v-if="message.engineDebug && !message.streaming" class="engine-debug">
                    <!-- "no cards" told nobody anything: a reply with no cards
                         is visibly a reply with no cards (Arsen 2026-08-24 —
                         "it is needless"). The timing still earns its place. -->
                    <span v-if="message.engineDebug.candidates != null">{{ message.engineDebug.shown }}/{{ message.engineDebug.candidates }} candidates ·</span>
                    <span v-if="message.engineDebug.cacheHit">cache HIT · </span>
                    {{ message.engineDebug.ms }}ms
                  </div>

                  <!-- Message feedback (only after the response has fully arrived —
                       i.e. streaming finished AND the lamp/bottle animation ended) -->
                  <div v-if="message.sender === 'ai' && !message.streaming && !message.itineraryStreaming && !streamingLampAnimatingIds.has(message.id)" class="message-feedback">
                    <button @click="toggleMessageFeedback(message, 'like')" class="feedback-btn msg-feedback-btn" :class="{ active: getMessageFeedback(message) === 'like' }" :title="t('chat.feedback.good_response')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    </button>
                    <button @click="toggleMessageFeedback(message, 'dislike')" class="feedback-btn msg-feedback-btn" :class="{ active: getMessageFeedback(message) === 'dislike' }" :title="t('chat.feedback.bad_response')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                    </button>
                    <div class="message-feedback-divider"></div>
                    <button @click="copyMessage(message)" class="feedback-btn msg-feedback-btn" :class="{ active: copiedMessageId === message.id }" :title="copiedMessageId === message.id ? t('chat.feedback.copied') : t('chat.feedback.copy_response')">
                      <svg v-if="copiedMessageId !== message.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button v-if="!isDesktop && !message.itineraryId" @click="shareMessage(message)" class="feedback-btn msg-feedback-btn" :title="t('chat.feedback.share')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg>
                    </button>
                    <!-- Itinerary share — shown once the trip exists (has an id).
                         Works on mobile (Web-Share sheet) and desktop (copies the
                         link, flashing a "Copied" state). -->
                    <button v-if="message.itineraryId" @click="shareItinerary(message)" class="feedback-btn msg-feedback-btn" :class="{ active: itinShareCopiedId === message.id }" :title="itinShareCopiedId === message.id ? t('chat.feedback.copied') : t('chat.feedback.share')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg>
                    </button>
                  </div>
                </div>
                <!-- User message copy button (below bubble) -->
                <div v-if="message.sender === 'user'" class="message-feedback user-message-feedback">
                  <button @click="copyMessage(message)" class="feedback-btn msg-feedback-btn" :class="{ active: copiedMessageId === message.id }" :title="copiedMessageId === message.id ? t('chat.feedback.copied') : t('chat.feedback.copy_message')">
                    <svg v-if="copiedMessageId !== message.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              </div>
              <div v-if="isTyping && !isGeneratingTitle && !messages.some(m => m.streaming)" class="message-bubble ai">
                <div class="content typing-content">
                  <AnimatedLamp :isLoading="isTyping" class="typing-lamp" :theme="resolveTheme()" />
                </div>
              </div>

              <transition name="slide-down">
                <div v-if="shouldShowSessionWarning" class="session-warning-banner">
                  <div class="warning-icon">
                    <svg width="40" height="40" viewBox="0 2 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="8" x2="12" y2="14" stroke-width="1"/>
                      <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </div>
                  <div class="warning-content">
                    <div class="warning-title">{{ t('chat.session.warning.title') }}</div>
                    <div class="warning-message">{{ sessionWarningMessage }}</div>
                  </div>
                  <div class="warning-actions">
                    <button @click="startNewChatFromWarning" class="warning-btn primary">
                      {{ t('chat.session.warning.start_new') }}
                    </button>
                    <button @click="dismissSessionWarning" class="warning-btn dismiss">
                      {{ t('chat.session.warning.continue') }}
                    </button>
                  </div>
                </div>
              </transition>

            </div>
          </div>
        </div>
      </div>

      <div class="fixed-input-container" :class="{ 'empty-chat': messages.length === 0 }">
        <div class="centered-content">
          <div class="ai-greeting" v-if="messages.length === 0">
            <img src="/images/bottle-greeting.png?v=2" class="greeting-icon" alt="Jinni">
            <div class="greeting">{{ greetingLine() }}</div>
          </div>
          <div class="chat-input-container">
            <!-- Quota notice. Lives here rather than in the transcript: it is
                 a status message about the account, not part of the
                 conversation, and it used to sit in the history forever as a
                 fake AI turn. Absolutely positioned so showing it never
                 shifts the composer under the user's fingers. -->
            <transition name="usage-notice">
              <div v-if="usageNotice" class="usage-notice" role="status">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16.5v.01"/></svg>
                <span>{{ usageNotice }}</span>
              </div>
            </transition>
            <!-- Shopping clarifier — contextual prompt attached to the input,
                 shown after tapping the Shopping quick action. Picking a chip
                 runs the search; the X dismisses it. -->
            <transition
              :css="false"
              @enter="clarifierEnter"
              @after-enter="clarifierAfterEnter"
              @leave="clarifierLeave"
            >
              <div v-if="showShoppingClarifier" class="input-clarifier">
                <div class="input-clarifier-head">
                  <span class="input-clarifier-title">{{ t('chat.shopping.prompt') }}</span>
                  <button @click="cancelShoppingClarifier" class="input-clarifier-close" :aria-label="t('common.close') || 'Close'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="input-clarifier-chips">
                  <button
                    v-for="opt in shoppingSubTypes"
                    :key="opt.subType"
                    @click="selectShoppingType(opt.subType)"
                    class="action-chip"
                    :disabled="isStreaming || isRequestPending || isOnCooldown"
                  >
                    {{ t(opt.labelKey) }}
                  </button>
                </div>
              </div>
            </transition>

            <!-- Itinerary clarifier — sequential steps (days, then hotel).
                 Same input slot & styling as the shopping clarifier. -->
            <div v-if="itineraryStep" class="input-clarifier">
              <!-- STEP 0: confirm nearby mode (only when Nearby is on) -->
              <template v-if="itineraryStep === 'confirmNearby'">
                <div class="input-clarifier-head">
                  <span class="input-clarifier-title">{{ t('chat.itinerary.nearby_confirm_title') }}</span>
                  <button @click="cancelItinerary" class="input-clarifier-close" :aria-label="t('common.close') || 'Close'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="itin-nearby-desc">{{ t('chat.itinerary.nearby_confirm_desc') }}</div>
                <div class="input-clarifier-chips">
                  <button @click="confirmNearbyItinerary(true)" class="action-chip" :disabled="isStreaming || isRequestPending || isOnCooldown">{{ t('chat.itinerary.nearby_confirm_keep') }}</button>
                  <button @click="confirmNearbyItinerary(false)" class="action-chip" :disabled="isStreaming || isRequestPending || isOnCooldown">{{ t('chat.itinerary.nearby_confirm_switch') }}</button>
                </div>
              </template>

              <!-- STEP 1: how many days -->
              <template v-if="itineraryStep === 'days'">
                <div class="input-clarifier-head">
                  <span class="input-clarifier-title">{{ t('chat.itinerary.days_prompt') }}</span>
                  <button @click="cancelItinerary" class="input-clarifier-close" :aria-label="t('common.close') || 'Close'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="input-clarifier-chips">
                  <button
                    v-for="n in [1,2,3,4,5,6,7]"
                    :key="'itin-d'+n"
                    @click="pickItineraryDays(n)"
                    class="action-chip"
                    :disabled="isStreaming || isRequestPending || isOnCooldown"
                  >
                    {{ n }} {{ n === 1 ? t('chat.itinerary.day') : t('chat.itinerary.days') }}
                  </button>
                </div>
              </template>

              <!-- STEP 1b: whole-trip budget (budget-style travelers only) -->
              <template v-else-if="itineraryStep === 'budget'">
                <div class="input-clarifier-head">
                  <span class="input-clarifier-title">{{ t('chat.itinerary.budget_prompt') || 'Set a budget for the whole trip? (optional)' }}</span>
                  <button @click="cancelItinerary" class="input-clarifier-close" :aria-label="t('common.close') || 'Close'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="itin-budget-fields">
                  <label class="itin-budget-field">
                    <span class="itin-budget-label">{{ t('chat.itinerary.budget_total') || 'Total budget' }}</span>
                    <span class="itin-budget-input">
                      <input type="number" min="0" inputmode="numeric" v-model.number="itineraryDraft.tripBudgetTotal"
                             :placeholder="t('chat.itinerary.budget_amount') || 'Amount'" @keyup.enter="submitItineraryBudget" />
                      <span class="itin-budget-cur">{{ tripBudgetCurrency() }}</span>
                    </span>
                  </label>
                  <label class="itin-budget-field">
                    <span class="itin-budget-label">{{ t('chat.itinerary.budget_people') || 'Travelers' }}</span>
                    <input class="itin-budget-people" type="number" min="1" max="20" inputmode="numeric" v-model.number="itineraryDraft.people" />
                  </label>
                </div>
                <p class="itin-budget-hint">{{ t('chat.itinerary.budget_hint') || 'Jinni will pick places to fit this — shown approximately, never exact.' }}</p>
                <div class="input-clarifier-chips">
                  <button class="action-chip chip-primary" :disabled="isStreaming || isRequestPending || isOnCooldown" @click="submitItineraryBudget">
                    {{ itineraryDraft.tripBudgetTotal > 0 ? (t('chat.itinerary.budget_continue') || 'Continue') : (t('chat.itinerary.budget_skip') || 'Skip budget') }}
                  </button>
                </div>
              </template>

              <!-- STEP 2: where are you staying (hotel) -->
              <template v-else-if="itineraryStep === 'hotel'">
                <div class="input-clarifier-head">
                  <span class="input-clarifier-title">{{ t('chat.itinerary.hotel_prompt') }}</span>
                  <button @click="cancelItinerary" class="input-clarifier-close" :aria-label="t('common.close') || 'Close'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <!-- Hidden while "Suggest hotels" is toggled on — the user
                     delegated the choice, so the free-text field is noise;
                     toggling suggest off brings it back. -->
                <div v-if="!itineraryDraft.pickHotel" class="itin-hotel-row">
                  <input
                    v-model="itineraryDraft.hotelName"
                    type="text"
                    class="itin-hotel-input"
                    :placeholder="t('chat.itinerary.hotel_placeholder')"
                    @keyup.enter="launchItinerary"
                    :disabled="isStreaming || isRequestPending || isOnCooldown"
                  />
                </div>
                <!-- Breakfast question — only for a TYPED hotel. On the
                     "Suggest hotels" path it's asked later, right after the
                     user picks one of the suggestions (ItineraryView chooser):
                     asking before any hotel exists was premature. Controls the
                     day start time and whether a breakfast cafe is scheduled
                     near the hotel. -->
                <div v-if="itineraryDraft.hotelName.trim()" class="input-clarifier-chips">
                  <span class="itin-breakfast-q">{{ t('chat.itinerary.breakfast_q') }}</span>
                  <button class="action-chip" :class="{ 'chip-on': itineraryDraft.hotelBreakfast }" @click="itineraryDraft.hotelBreakfast = true">{{ t('chat.itinerary.breakfast_yes') }}</button>
                  <button class="action-chip" :class="{ 'chip-on': !itineraryDraft.hotelBreakfast }" @click="itineraryDraft.hotelBreakfast = false">{{ t('chat.itinerary.breakfast_no') }}</button>
                </div>
                <div class="input-clarifier-chips">
                  <button
                    v-if="!itineraryDraft.hotelName.trim()"
                    @click="suggestHotelsAndLaunch"
                    class="action-chip"
                    :disabled="isStreaming || isRequestPending || isOnCooldown"
                  >
                    {{ t('chat.itinerary.suggest_hotels') }}
                  </button>
                  <button
                    @click="launchItinerary"
                    class="action-chip"
                    :disabled="isStreaming || isRequestPending || isOnCooldown"
                  >
                    {{ itineraryDraft.hotelName.trim() ? t('chat.itinerary.start') : t('chat.itinerary.skip_hotel') }}
                  </button>
                </div>
              </template>
            </div>

            <!-- Preference context bar — ambient summary of the active
                 preferences shaping answers. Lives in the input container so
                 the "why did it respond like that" answer sits next to the
                 action. Yields the slot to the shopping clarifier. -->
            <transition
              :css="false"
              @enter="clarifierEnter"
              @after-enter="clarifierAfterEnter"
              @leave="clarifierLeave"
            >
              <div
                v-if="showPreferenceBar"
                class="preference-bar"
                :class="isDesktop ? 'preference-bar--desktop' : 'preference-bar--mobile'"
              >
                <span class="preference-bar-lead">
                  {{ t('chat.preferences.answering_with') }}
                </span>

                <div class="preference-bar-chips">
                  <button
                    v-for="chip in prefChips"
                    :key="chip.key"
                    type="button"
                    class="preference-chip"
                    @click="goEditPreferences(chip.key)"
                    :title="t('chat.preferences.edit_hint')"
                  >
                    <span class="preference-chip-ic">
                      <svg v-if="chip.key === 'interests'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <svg v-else-if="chip.key === 'style'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z"/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/></svg>
                      <svg v-else-if="chip.key === 'budget'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
                      <svg v-else-if="chip.key === 'location'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <span class="preference-chip-label">{{ chip.label }}</span>
                  </button>
                </div>
              </div>
            </transition>

            <div class="input-row">
              <button @click="toggleNearbyMode" class="mode-toggle-inline" :class="{'mode-nearby': nearbyMode, 'mode-discovery': !nearbyMode, 'disabled-cooldown': isOnCooldown, 'with-text': isDesktop}" :disabled="isOnCooldown">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path v-if="nearbyMode" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <path v-else d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  <circle v-if="nearbyMode" cx="12" cy="10" r="3"/>
                </svg>
                <span v-if="isDesktop" class="mode-label">{{ nearbyMode ? t('chat.input.mode_nearby') : t('chat.input.mode_discovery') }}</span>
              </button>
              <div class="input-wrapper">
                <textarea
                  v-model="userInput"
                  @keydown.enter.exact.prevent="handleEnterKey"
                  @keydown.enter.shift.exact="handleShiftEnter"
                  :placeholder="isOnCooldown ? cooldownMessage : (modeSwitchNotice || t('chat.input.placeholder'))"
                  ref="chatInput"
                  rows="1"
                  @input="adjustTextareaHeight"
                  @paste="handlePaste"
                  :disabled="isOnCooldown"
                  :class="{ 'input-disabled': isOnCooldown }"
                  :maxlength="MAX_INPUT_LENGTH"
                ></textarea>
                <button v-if="!userInput.trim()" @click.stop="toggleMobileActionsPopover($event)" class="mobile-toggle-inline" :class="{ 'disabled-cooldown': isOnCooldown }" :disabled="isOnCooldown">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121"/>
                  </svg>
                </button>
                <button @click="sendMessage" class="send-button" :disabled="isOnCooldown" :class="{ 'disabled-cooldown': isOnCooldown }" :title="t('chat.input.send')">
                  <svg v-if="!isStreaming" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="mobile-actions-popover-container">                  
            <transition name="actions-popover">
              <div v-if="showMobileActions" class="mobile-actions-popover" v-click-outside="closeMobileActionsPopover">
                <div class="popover-actions-list">
                  <button
                    v-for="action in quickActions"
                    :key="action.id"
                    @click="triggerQuickAction(action.id)"
                    class="popover-action-btn"
                    :class="{'action-disabled': actionUsageStatus[action.id]?.usage >= 3, 'disabled-cooldown': isOnCooldown}"
                    :disabled="actionUsageStatus[action.id]?.usage >= 3 || isRequestPending || isOnCooldown"
                  >
                    <span class="popover-action-label">{{ t(`chat.actions.${action.id}`) }}</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          <div class="ai-note" v-if="messages.length !== 0">
            {{ t('chat.messages.jinni_mistakes') }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Share Progress Overlay ─────────────────────────────────────────── -->
  <transition name="share-fade">
    <div v-if="shareProgress.active" class="share-progress-overlay">
      <div class="share-progress-card" :class="currentTheme">
        <div class="share-progress-genie">✨</div>
        <div class="share-progress-title">{{ t('chat.share.preparing') }}</div>
        <div class="share-progress-bar-wrap">
          <div class="share-progress-bar" :style="{ width: shareProgress.total > 0 ? (shareProgress.current / shareProgress.total * 100) + '%' : '0%' }"></div>
        </div>
        <div class="share-progress-label">
          <template v-if="shareProgress.current < shareProgress.total">
            {{ t('chat.share.fetching', { current: shareProgress.current, total: shareProgress.total }) }}
          </template>
          <template v-else>
            {{ t('chat.share.almost') }}
          </template>
        </div>
      </div>
    </div>
  </transition>

  <div v-if="showProfileModal" class="profile-modal">
    <div class="modal-content" :class="currentTheme === 'night-mode' ? 'night' : 'day'">
      <div class="modal-header">
        <h3>
          {{ t('profile.title') }}<span class="modal-title-plan" :class="usage && usage.isPremium ? 'is-premium' : 'is-free'"> · {{ usage && usage.isPremium ? t('profile.plan.premium') : t('profile.plan.free') }}</span>
        </h3>
        <button @click="showProfileModal = false" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        </button>
      </div>
      <div v-if="loadingUserData" class="loading-container"></div>
      <div v-else class="profile-body">
        <!-- ═══ Identity row ═══
             Avatar, name and plan read left-to-right on one line. The old
             layout stacked and centred them, which pushed the name into the
             middle of the modal with empty space either side and left the
             plan stranded in a card of its own further down. -->
        <div class="profile-info">
          <div v-if="userAvatar" class="avatar-container">
            <img :src="userAvatar" class="profile-avatar" alt="Profile">
          </div>
          <div v-else class="avatar-container">
            <div class="profile-avatar default-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div class="profile-details">
            <h4>{{ userName }}</h4>
            <p>{{ userEmail }}</p>
          </div>
        </div>

        <!-- ═══ Plan & daily usage ═══
             "Plan" (Free / Premium) mirrors the backend's isPremium flag, and
             the two meters are the two budgets the backend actually enforces:
             places viewed, and the token allowance shown as REQUESTS — the
             unit people think in (getUsageStatus already converts it). -->
        <div class="plan-card" :class="{ 'plan-card--premium': usage && usage.isPremium }">

          <div v-if="usageLoading" class="plan-usage">
            <span class="plan-meter-skeleton"></span>
            <span class="plan-meter-skeleton"></span>
          </div>

          <div v-else-if="usage" class="plan-usage">
            <!-- Cooldown outranks the meters: while it is active the numbers
                 do not matter, only when service comes back. -->
            <div v-if="usage.cooldown && usage.cooldown.active" class="plan-cooldown">
              {{ t('profile.plan.cooldown', { hours: usage.cooldown.hoursRemaining }) }}
            </div>

            <div class="plan-meter">
              <div class="plan-meter-top">
                <span>{{ t('profile.plan.places') }}</span>
                <span class="plan-meter-num">{{ usage.daily.places.viewed }} / {{ usage.daily.places.limit }}</span>
              </div>
              <div class="plan-bar"><span class="plan-bar-fill" :class="barClass(usage.daily.places.percentage)" :style="{ width: Math.min(100, usage.daily.places.percentage) + '%' }"></span></div>
            </div>

            <div class="plan-meter">
              <div class="plan-meter-top">
                <span>{{ t('profile.plan.requests') }}</span>
                <span class="plan-meter-num">{{ usage.daily.requests.estimatedRemaining }} {{ t('profile.plan.left') }}</span>
              </div>
              <div class="plan-bar"><span class="plan-bar-fill" :class="barClass(usage.daily.tokens.percentage)" :style="{ width: Math.min(100, usage.daily.tokens.percentage) + '%' }"></span></div>
            </div>

            <div class="plan-reset">
              {{ t('profile.plan.resets_daily') }}<template v-if="premiumExpiryLabel"> · {{ premiumExpiryLabel }}</template>
            </div>
          </div>

          <div v-else class="plan-reset">{{ t('profile.plan.unavailable') }}</div>

          <button v-if="!usage || !usage.isPremium" class="plan-cta" @click="goToSubscribe">
            {{ t('profile.plan.upgrade') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- ═══ Preferences ═══
             A tile grid rather than a stack of bordered rows: each preference
             reads as its own object, the values get room to breathe instead of
             being right-aligned against a label, and the section gains a real
             heading with the edit action beside it. -->
        <div class="profile-preferences">
          <div class="prefs-head">
            <h4 class="prefs-title">{{ t('profile.edit_preferences') }}</h4>
            <button @click="editPreferences" class="edit-prefs-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              {{ t('profile.edit') }}
            </button>
          </div>

          <div class="prefs-grid">
            <div class="pref-tile pref-tile--wide">
              <span class="pref-tile-label">
                <svg class="pref-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ t('profile.interests') }}
              </span>
              <div v-if="userPreferences.interests && userPreferences.interests.length" class="pref-chips">
                <span v-for="interest in userPreferences.interests" :key="interest" class="pref-chip">{{ formatInterest(interest) }}</span>
              </div>
              <span v-else class="pref-tile-value is-empty">{{ t('profile.not_set') }}</span>
            </div>

            <div class="pref-tile">
              <span class="pref-tile-label">
                <svg class="pref-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z"/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/></svg>
                {{ t('profile.style') }}
              </span>
              <span class="pref-tile-value" :class="{ 'is-empty': !formatTravelStyle(userPreferences.travelStyle) }">
                {{ formatTravelStyle(userPreferences.travelStyle) || t('profile.not_specified') }}
              </span>
            </div>

            <div class="pref-tile">
              <span class="pref-tile-label">
                <svg class="pref-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ t('profile.location') }}
              </span>
              <span class="pref-tile-value" :class="{ 'is-empty': !(userSettings.location.city && userSettings.location.countryName) }">
                <template v-if="userSettings.location.city && userSettings.location.countryName">
                  {{ userSettings.location.city }}, {{ userSettings.location.countryName }}
                </template>
                <template v-else>{{ t('profile.not_set') }}</template>
              </span>
            </div>

            <div v-if="userPreferences.budget && (userPreferences.budget.min > 0 || userPreferences.budget.max > 0)" class="pref-tile pref-tile--wide">
              <span class="pref-tile-label">
                <svg class="pref-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
                {{ t('profile.budget') }}
              </span>
              <span class="pref-tile-value">{{ formatBudget(userPreferences.budget) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="settings-modal" v-if="showSettingsModal">
    <div class="modal-content settings-content" :class="currentTheme === 'night-mode' ? 'night' : 'day'">
      <div class="modal-header">
        <h3>{{ t('settings.title') }}</h3>
        <button @click="closeSettings" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="settings-body">
        <div class="settings-section">
          <h4>{{ t('settings.display.title') }}</h4>
          <div class="setting-item">
            <label>{{ t('settings.display.language') }}</label>
            <div class="expandable-selector" :class="{ 'expanded': showLanguageDropdown }">
              <button @click="toggleLanguageDropdown" class="selector-trigger">
                <span class="current-selection">
                  <span>{{ getLanguageName(userSettings.language) }}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotated': showLanguageDropdown }">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>              
              <transition name="expand">
                <div v-if="showLanguageDropdown" class="selector-dropdown-inline">
                  <input ref="languageSearchInput" v-model="languageSearch" :placeholder="t('settings.search_languages')" class="dropdown-search" @click.stop>
                  <div class="dropdown-list">
                    <div v-for="lang in filteredLanguages" :key="lang.code" @click="selectLanguage(lang.code); showLanguageDropdown = false" class="dropdown-item" :class="{ 'selected': userSettings.language === lang.code }">
                      <span class="item-name">{{ lang.name }}</span>
                      <span class="item-native">{{ lang.nativeName }}</span>
                      <svg v-if="userSettings.language === lang.code" class="checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="setting-item">
            <label>{{ t('settings.display.font_style') }}</label>
            <div class="expandable-selector" :class="{ 'expanded': showFontDropdown }">
              <button @click="showFontDropdown = !showFontDropdown" class="selector-trigger" type="button">
                <span class="current-selection"><span>{{ t('settings.display.font_' + (userSettings.fontStyle || 'standard')) }}</span></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotated': showFontDropdown }"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <transition name="expand">
                <div v-if="showFontDropdown" class="selector-dropdown-inline">
                  <div class="dropdown-list">
                    <div v-for="f in ['standard','classic','elegant','modern','journal']" :key="f" @click="setDisplayPref('fontStyle', f); showFontDropdown = false" class="dropdown-item" :class="{ 'selected': (userSettings.fontStyle || 'standard') === f }">
                      <span class="item-name">{{ t('settings.display.font_' + f) }}</span>
                      <svg v-if="(userSettings.fontStyle || 'standard') === f" class="checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="setting-item">
            <label>{{ t('settings.display.text_size') }}</label>
            <div class="theme-buttons">
              <button v-for="z in ['small','normal','big']" :key="z" type="button" class="theme-btn" :class="{ active: (userSettings.textSize || 'normal') === z }" @click="setDisplayPref('textSize', z)">{{ t('settings.display.size_' + z) }}</button>
            </div>
          </div>
          <div class="setting-item">
            <label>{{ t('settings.display.theme') }}</label>
            <div class="theme-buttons">
              <button @click="setTheme('light')" :class="{ active: userSettings.theme === 'light' }" class="theme-btn day-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                {{ t('settings.display.theme_light') }}
              </button>
              <button @click="setTheme('auto')" :class="{ active: userSettings.theme === 'auto' }" class="theme-btn system-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                {{ t('settings.display.theme_system') }}
              </button>
              <button @click="setTheme('dark')" :class="{ active: userSettings.theme === 'dark' }" class="theme-btn night-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                {{ t('settings.display.theme_dark') }}
              </button>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <h4>{{ t('settings.search.title') }}</h4>
          <p class="settings-description">{{ t('settings.search.description') }}</p>
          <div class="setting-item">
            <label>
              <span>{{ t('settings.search.nearby_mode') }}</span>
              <span class="setting-value">{{ userSettings.searchRadius.nearby }} km</span>
            </label>
            <div class="slider-container">
              <input type="range" v-model.number="userSettings.searchRadius.nearby" min="1" max="20" step="1" @input="saveSettings" class="setting-slider">
              <div class="slider-labels">
                <span>1 km</span>
                <span>{{ t('settings.search.close') }}</span>
                <span>20 km</span>
              </div>
            </div>
          </div>
          <div class="setting-item">
            <label>
              <span>{{ t('settings.search.discovery_mode') }}</span>
              <span class="setting-value">{{ userSettings.searchRadius.discovery }} km</span>
            </label>
            <div class="slider-container">
              <input type="range" v-model.number="userSettings.searchRadius.discovery" min="10" max="100" step="5" @input="saveSettings" class="setting-slider">
              <div class="slider-labels">
                <span>10 km</span>
                <span>{{ t('settings.search.wide_area') }}</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <h4>{{ t('settings.privacy.title') }}</h4>
          <p class="settings-description">{{ t('settings.privacy.description') }}</p>
          <div class="setting-toggle">
            <div class="toggle-label">
              <span>{{ t('settings.privacy.use_location') }}</span>
              <p class="setting-help">{{ t('settings.privacy.location_help') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="userSettings.privacy.autoDetectLocation" @change="toggleLocationPermission($event.target.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <div class="settings-section danger-zone">
          <h4>{{ t('settings.danger.title') }}</h4>
          <div class="danger-item">
            <div class="danger-item-info">
              <label>{{ t('settings.danger.delete_chats.label') }}</label>
              <span class="danger-description">
                {{ t('settings.danger.delete_chats.description_before') }}
                <span class="danger-link" :class="{ 'danger-link--active': dangerConfirm.deleteChats.step > 0 }" @click="dangerConfirm.deleteChats.step === 0 && showDeleteChatsConfirm()">
                  {{ t('settings.danger.delete_chats.link') }}
                </span>{{ t('settings.danger.delete_chats.description_after') }}
              </span>
            </div>
          </div>
          <div v-if="dangerConfirm.deleteChats.step === 1" class="danger-confirm-box">
            <p>{{ t('settings.danger.delete_chats.confirm') }}</p>
            <div class="danger-confirm-actions">
              <button class="danger-btn-yes" @click="executeDeleteAllChats">{{ t('settings.danger.delete_chats.yes') }}</button>
              <button class="danger-btn-no"  @click="cancelDeleteChats">{{ t('settings.danger.delete_chats.no') }}</button>
            </div>
          </div>
          <div class="danger-item">
            <div class="danger-item-info">
              <label>{{ t('settings.danger.delete_account.label') }}</label>
              <span class="danger-description">
                {{ t('settings.danger.delete_account.description_before') }}
                <span class="danger-link delete-account-link" :class="{ 'danger-link--active': dangerConfirm.deleteAccount.step > 0 }" @click="dangerConfirm.deleteAccount.step === 0 && showDeleteAccountConfirm()">
                  {{ t('settings.danger.delete_account.link') }}
                </span>{{ t('settings.danger.delete_account.description_after') }}
              </span>
            </div>
          </div>
          <div v-if="dangerConfirm.deleteAccount.step === 1" class="danger-confirm-box">
            <p v-html="t('settings.danger.delete_account.confirm')"></p>
            <div class="danger-confirm-actions">
              <button class="danger-btn-yes" @click="dangerConfirm.deleteAccount.step = 2">{{ t('settings.danger.delete_chats.yes') }}</button>
              <button class="danger-btn-no"  @click="cancelDeleteAccount">{{ t('settings.danger.delete_chats.no') }}</button>
            </div>
          </div>
          <div v-if="dangerConfirm.deleteAccount.step === 2" class="danger-confirm-box danger-confirm-box--type">
            <p v-html="t('settings.danger.delete_account.type_confirm')"></p>
            <input v-model="dangerConfirm.deleteAccount.typedValue" class="danger-type-input" :placeholder="t('settings.danger.delete_account.type_placeholder')" autocomplete="off" spellcheck="false"/>
            <div class="danger-confirm-actions">
              <button class="danger-btn-yes" :disabled="dangerConfirm.deleteAccount.typedValue !== 'DELETE'" @click="executeDeleteAccount">{{ t('settings.danger.delete_account.confirm_button') }}</button>
              <button class="danger-btn-no" @click="cancelDeleteAccount">{{ t('settings.danger.delete_account.cancel') }}</button>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <h4>Chat engine</h4>
          <p class="settings-description">V2 is the new engine being built in parallel (beta). Applies to chat messages; quick actions stay on V1.</p>
          <div class="setting-item">
            <div class="theme-buttons">
              <button type="button" class="theme-btn" :class="{ active: chatEngine === 'v1' }" @click="setChatEngine('v1')">V1 · stable</button>
              <button type="button" class="theme-btn" :class="{ active: chatEngine === 'v2' }" @click="setChatEngine('v2')">V2 · beta</button>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <button @click="resetSettings" class="reset-btn">
            {{ t('settings.reset') }}
          </button>
        </div>
        <div v-if="settingsSaved" class="settings-saved-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {{ t('settings.saved') }}
        </div>
      </div>
    </div>
  </div>

  <!-- Teleported to <body> so it shares the same stacking context as the
       fullscreen map (which also teleports to body). This lets the modal sit
       ON TOP of the fullscreen map instead of us having to drop out of
       fullscreen to show it. -->
  <Teleport to="body">
  <div v-if="showInfoModal" class="info-modal-overlay" @click="closeInfoModal">
    <div class="info-modal" :class="[currentTheme === 'night-mode' ? 'night' : 'day', infoModalTierClass]" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedPlace?.name }}</h3>
      </div>
      <div class="modal-body">
        <div v-if="loadingPlaceDetails" class="loading-container">
          <p>{{ t('place_info.loading') }}</p>
        </div>
        <div v-else class="place-details">
          <!-- Category / type subtitle, directly under the title -->
          <div class="pd-subtitle" v-if="selectedPlace?.category || selectedPlace?.type">
            {{ selectedPlace.category || selectedPlace.type }}
          </div>

          <!-- Event Schedule (events only).
               Surfaced first when the listing is an event, because for an
               event the date/time is THE primary fact (more so than rating
               or phone). isEventRec() checks both the eventSchedule object
               (preferred, from formatBusinessDetails) and falls back to the
               category label for legacy/cached recs. -->
          <div class="info-row info-row--event" v-if="isEventRec(infoEventSource) && formatEventScheduleFull(infoEventSource)">
            <!-- No "Event date" label: the subtitle directly above already
                 says Event, so the words were pure repetition. A recurring
                 schedule still needs its word, since "Weekly" alone is odd. -->
            <span v-if="formatEventScheduleFull(infoEventSource).recurring" class="label">{{ t('chat.event.schedule') }}</span>
            <div class="value event-schedule-value">
              <span class="event-schedule-primary">{{ formatEventScheduleFull(infoEventSource).primary }}</span>
              <span v-if="formatEventScheduleFull(infoEventSource).secondary" class="event-schedule-secondary">
                {{ formatEventScheduleFull(infoEventSource).secondary }}
              </span>
              <span v-if="(placeDetails?._isExpired || selectedPlace?._isExpired)" class="event-schedule-ended-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ t('chat.event.ended') }}
              </span>
            </div>
          </div>

          <!-- Inline star rating -->
          <div class="pd-rating" v-if="placeDetails?.rating && shouldShowRating(selectedPlace)">
            <svg class="pd-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26 6.85.6-5.18 4.52 1.55 6.7L12 17.27 5.88 20.58l1.55-6.7L2.25 8.86l6.85-.6z"/></svg>
            <span class="pd-rating-num">{{ placeDetails.rating }}</span>
            <span class="pd-rating-out">/5</span>
            <span v-if="placeDetails.totalReviews" class="review-count">
              {{ t('place_info.reviews', { count: placeDetails.totalReviews }) }}
            </span>
          </div>

          <!-- Quick actions: Directions (primary), Call, Website, Search -->
          <div class="pd-actions">
            <button @click="openInMaps" class="pd-action pd-action--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>{{ t('place_info.get_directions') }}</span>
            </button>
            <a v-if="placeDetails?.phone" :href="`tel:${placeDetails.phone}`" @click="trackInteraction(selectedPlace, 'phone_click')" class="pd-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>{{ t('place_info.phone') }}</span>
            </a>
            <button @click="searchOnline" class="pd-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>{{ t('place_info.search_online') }}</span>
            </button>
            <a v-if="placeDetails?.website" :href="placeDetails.website" target="_blank" @click="trackInteraction(selectedPlace, 'website_click')" class="pd-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>{{ t('place_info.website') }}</span>
            </a>
          </div>

          <div class="pd-divider"></div>

          <!-- Icon-leading facts. Price leads: for an event it is the fact
               a traveler decides on, and it used to sit below the address. -->
          <!-- Ticket price, verbatim from the listing ("3000 AMD"). Events
               never carry Google's `pricing`, so without this row the price we
               DID read off the page never reached the traveler. -->
          <div class="pd-fact" v-if="infoTicketPrice">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
            <div class="pd-fact-body">
              {{ infoTicketPrice }}
              <!-- The listing's own number is the fact and stays untouched; this
                   is a rounded conversion into the traveler's currency, and it
                   says so with ≈. Absent whenever it would be a guess. -->
              <span v-if="infoTicketApprox" class="pd-price-approx">{{ infoTicketApprox }}</span>
            </div>
          </div>

          <div class="pd-fact">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
            <div class="pd-fact-body">{{ placeDetails?.address || selectedPlace?.address }}</div>
          </div>

          <div class="pd-fact" v-if="placeDetails?.hours?.length">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
            <div class="pd-fact-body pd-hours">
              <div v-for="(h, i) in hoursParsed" :key="i" class="pd-hours-row">
                <span class="pd-hours-day">{{ h.day }}</span>
                <span v-if="h.time" class="pd-hours-time">{{ h.time }}</span>
              </div>
            </div>
          </div>

          <div class="pd-fact" v-if="placeDetails?.pricing">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
            <div class="pd-fact-body">{{ placeDetails.pricing }}</div>
          </div>

          <div class="pd-fact" v-if="placeDetails?.email">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg></span>
            <div class="pd-fact-body"><a :href="`mailto:${placeDetails.email}`">{{ placeDetails.email }}</a></div>
          </div>

          <div class="pd-fact pd-fact--desc" v-if="placeDetails?.description && (typeof placeDetails.description === 'string' ? placeDetails.description.trim() : (placeDetails.description.short || placeDetails.description.detailed))">
            <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
            <div class="pd-fact-body">{{ typeof placeDetails.description === 'string' ? placeDetails.description : (placeDetails.description.short || placeDetails.description.detailed) }}</div>
          </div>

          <!-- Highlights — curated feature showcase -->
          <div class="pd-highlights" v-if="placeDetails?.highlights?.length">
            <div class="pd-highlights-head">
              {{ t('place_info.highlights') }}
            </div>
            <div class="pd-highlights-grid">
              <div v-for="h in placeDetails.highlights" :key="h" class="pd-highlight-item">
                <svg class="pd-highlight-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{{ h }}</span>
              </div>
            </div>
          </div>

          <!-- Social -->
          <div class="social-links pd-chips" v-if="placeDetails?.socialMedia?.instagram || placeDetails?.socialMedia?.facebook || placeDetails?.socialMedia?.tripadvisor">
            <a v-if="placeDetails.socialMedia?.instagram" :href="placeDetails.socialMedia.instagram" target="_blank" class="social-link social-link--instagram" @click="trackInteraction(selectedPlace, 'instagram_click')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a v-if="placeDetails.socialMedia?.facebook" :href="placeDetails.socialMedia.facebook" target="_blank" class="social-link social-link--facebook" @click="trackInteraction(selectedPlace, 'facebook_click')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a v-if="placeDetails.socialMedia?.tripadvisor" :href="placeDetails.socialMedia.tripadvisor" target="_blank" class="social-link social-link--tripadvisor" @click="trackInteraction(selectedPlace, 'tripadvisor_click')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c1.93 0 3.75.58 5.27 1.57l1.6-1.6 1.06 1.06-1.48 1.48A9.44 9.44 0 0 1 21.5 12c0 5.247-4.253 9.5-9.5 9.5S2.5 17.247 2.5 12 6.753 2.5 12 2.5zm0 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm-3.5 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 1.5c-.69 0-1.327.212-1.856.574l.67.67a1 1 0 0 1 0 1.414l-.67.67c.53.362 1.166.572 1.856.572s1.326-.21 1.856-.572l-.67-.67a1 1 0 0 1 0-1.414l.67-.67A3.144 3.144 0 0 0 12 12z"/></svg>
              TripAdvisor
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>

  <div v-if="showSessionLimitModal" class="session-limit-modal-overlay" @click="showSessionLimitModal = false">
    <div class="session-limit-modal" :class="currentTheme === 'night-mode' ? 'night-mode' : 'day-mode'" @click.stop>
      <div class="modal-header">
        <div class="modal-icon warning">
          <svg width="52" height="52" viewBox="0 2 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="8" x2="12" y2="14" stroke-width="1"/>
            <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h3>{{ t('chat.session.limit_modal.title') }}</h3>
      </div>
      <div class="modal-body">
        <div class="limit-explanation">
          <p v-html="t('chat.session.limit_modal.explanation', { count: Math.ceil((sessionHealth.messageCount || 0) / 2) })"></p>
        </div>
        <p class="limit-reason">{{ t('chat.session.limit_modal.reasons_title') }}</p>
        <ul class="limit-reasons">
          <li>{{ t('chat.session.limit_modal.reasons.slow') }}</li>
          <li>{{ t('chat.session.limit_modal.reasons.consume') }}</li>
          <li>{{ t('chat.session.limit_modal.reasons.reduce') }}</li>
        </ul>
        <p>{{ t('chat.session.limit_modal.suggestion') }}</p>
      </div>
      <div class="modal-actions">
        <button @click="startNewChatFromWarning" class="btn-primary large">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          {{ t('chat.session.limit_modal.start_new') }}
        </button>
        <button @click="showSessionLimitModal = false" class="btn-secondary">
          {{ t('chat.session.limit_modal.go_back') }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showFullscreenModal" class="fullscreen-image-modal" @click="closeFullscreenModal">
    <div class="fullscreen-image-container" @click.stop>
      <div v-if="fullscreenImages.length > 0" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <img :src="fullscreenImages[currentFullscreenIndex]?.url || fullscreenImages[currentFullscreenIndex]?.src" :alt="fullscreenImages[currentFullscreenIndex]?.title || 'Image'" class="fullscreen-image" @load="handleFullscreenImageLoad" @error="handleImageError">
        <button v-if="fullscreenImages.length > 1" @click.stop="previousFullscreenImage" :disabled="currentFullscreenIndex === 0" class="fullscreen-nav-btn fullscreen-prev">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button v-if="fullscreenImages.length > 1" @click.stop="nextFullscreenImage" :disabled="currentFullscreenIndex === fullscreenImages.length - 1" class="fullscreen-nav-btn fullscreen-next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div v-if="fullscreenImages.length > 1" class="fullscreen-counter">
          {{ currentFullscreenIndex + 1 }} / {{ fullscreenImages.length }}
        </div>
      </div>
      <button @click="closeFullscreenModal" class="fullscreen-close-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>

  <transition name="slide-panel">
    <div v-if="savedPlacesOpen" class="saved-panel-overlay" @click.self="closeSavedPlaces">
      <div class="saved-panel glacier" :class="currentTheme === 'night-mode' ? 'night' : 'day'">

        <div class="saved-panel-header">
          <h3>{{ t('chat.saved.title') }}</h3>
          <button @click="closeSavedPlaces" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="saved-panel-body">
          <div v-if="!savedPlacesLoading && savedPlaces.length === 0" class="saved-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p>{{ t('chat.saved.empty_title') }}</p>
            <span>{{ t('chat.saved.empty_hint') }}</span>
          </div>

          <div v-else class="saved-rec-list">
            <div v-for="item in savedRecs" :key="item.save._id" class="inline-recommendation-wrapper">
              <div :class="['rec-card-wrapper', getPartnerWrapperClass(item.rec)]">
                <div class="recommendation-card" @touchstart="handleCardTouchStart(item.rec, $event)" @touchend="handleCardTouchEnd(item.rec, $event)">
                <template v-if="item.rec.image">
                  <div class="rec-image">
                    <img :src="getImageUrl(item.rec.image)" :alt="item.rec.name" @error="handleImageError" loading="lazy">
                    <div class="image-overlay">
                      <div class="overlay-actions">
                        <button @click.stop="showPlaceInfo(item.rec)" class="text-action-btn info-btn" :disabled="isOnCooldown" :class="{ 'disabled-cooldown': isOnCooldown }">
                          {{ t('chat.recommendations.more') }}
                        </button>
                      </div>
                    </div>
                    <!-- Bookmark = remove from saved (filled while saved) -->
                    <button @click.stop="toggleSave(item.rec, $event)" @touchstart.stop="() => {}" class="rec-image-save-btn" :class="{ saved: isSaved(item.rec) }" :title="isSaved(item.rec) ? t('chat.saved.remove_saved') : t('chat.saved.save_place')" :disabled="!getRecRef(item.rec)">
                      <svg v-if="isSaved(item.rec)" width="24" height="90" viewBox="0 0 24 90" fill="url(#saveGradientSaved)" stroke="none">
                        <defs>
                          <linearGradient id="saveGradientSaved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgb(212,175,55)"/>
                            <stop offset="100%" stop-color="rgb(255,140,0)"/>
                          </linearGradient>
                        </defs>
                        <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="rec-image loading-skeleton"><div class="skeleton-shimmer"></div></div>
                </template>
                <div class="rec-details">
                  <div class="rec-header">
                    <div class="rec-name">{{ item.rec.name }}</div>
                    <!-- Image request button (restored) -->
                    <button @click.stop="requestImages(item.rec)" class="image-request-btn" :class="{ 'loading': getButtonState(item.rec) === 'loading' }" :disabled="isButtonDisabled(item.rec) || isOnCooldown">
                      <svg v-if="getButtonState(item.rec) !== 'loading'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <svg v-else class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                    </button>
                  </div>
                  <div class="rec-type"><span>{{ item.rec.category || item.rec.type }}</span></div>
                  <div v-if="isEventRec(item.rec) && formatEventScheduleCard(item.rec)" class="rec-event-schedule">
                    <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div class="rec-event-schedule-text">
                      <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(item.rec).primary }}</span>
                      <span v-if="formatEventScheduleCard(item.rec).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(item.rec).secondary }}</span>
                    </div>
                    <span v-if="item.rec._isExpired" class="rec-event-ended">{{ t('chat.event.ended') }}</span>
                  </div>
                  <!-- description intentionally omitted on the card; it shows in the Info modal -->
                  <div class="rec-metadata">
                    <div v-if="item.rec.address || item.rec.location" class="rec-location">{{ item.rec.address || item.rec.location }}</div>
                  </div>
                </div>
              </div><!-- /recommendation-card -->
              <div class="rec-card-bottom">
                <div v-if="(item.rec.verifiedId || item.rec.id?.startsWith('db-')) && item.rec._verifiedModel !== 'destination'" :class="['partner-label', getPartnerLabelClass(item.rec)]" v-html="getPartnerIcon(item.rec) + ' ' + getPartnerLabel(item.rec)"></div>
              </div>
              </div><!-- /rec-card-wrapper -->
            </div>
          </div>

          <div v-if="savedPlacesLoading" class="saved-loading">
            <div v-for="i in 4" :key="i" class="saved-skeleton-card">
              <div class="saved-skeleton-image"></div>
              <div class="saved-skeleton-lines">
                <div class="saved-skeleton-line long"></div>
                <div class="saved-skeleton-line short"></div>
              </div>
            </div>
          </div>

          <div v-if="savedPlacesHasMore && !savedPlacesLoading" class="saved-load-more">
            <button @click="loadSavedPlaces(false)" class="load-more-btn">{{ t('chat.saved.load_more') }}</button>
          </div>
        </div>

      </div>
    </div>
  </transition>

</template>





<script>
import axios from 'axios';
import AnimatedLamp from '@/components/ui/AnimatedLamp.vue';
import SwitchModeOverlay from '@/components/ui/SwitchModeOverlay.vue';
import RecommendationMap from '@/components/ui/RecommendationMap.vue';
import ItineraryView from '@/components/ui/ItineraryView.vue';
import { isNightTime } from '@/utils/timeUtils';
import { applyDisplayPrefs as applyDisplayPrefsGlobal } from '../utils/displayPrefs'
import { useI18n } from 'vue-i18n';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.5:5000';
/** How long the preference bar stays visible after it reveals. */
const PREFERENCE_BAR_HIDE_MS = 5000;
/** How long the quota notice stays above the composer. */
const USAGE_NOTICE_MS = 5000;
const MAX_INPUT_LENGTH = 2000;

export default {
  name: 'JinniChat',
  setup() {
    const { t, locale } = useI18n();
    return {t,locale};
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) { if (!(el === event.target || el.contains(event.target))) { binding.value() } };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) { document.body.removeEventListener('click', el.clickOutsideEvent) }
    }
  },
  components: { AnimatedLamp, SwitchModeOverlay, RecommendationMap, ItineraryView },
  data() {
    return {
      // iOS keyboard: top offset (px) of the fixed filler strip that covers
      // the gap between the shrunk chat shell and the keyboard. 0 = hidden.
      kbStripTop: 0,
      // Per-session signature of the last persisted message state, keyed by
      // session id. saveCurrentSession() compares against this and skips the
      // PATCH (and the updatedAt bump) when nothing has actually changed —
      // so merely viewing a chat doesn't re-timestamp it and reshuffle the
      // sidebar (which is sorted by updatedAt).
      _savedSignatures: {},
      sidebarOpen: true,
      mobileSidebarOpen: false,
      showMobileActions: false,
      showProfileMenu: false,
      isSwitching: false,
      isDesktop: true,
      isGeneratingTitle: false,
      tokenCheckInterval: null,
      chatSessions: [],
      activeSessionId: null,
      loadingSessions: false,
      messages: [],
      userInput: '',
      isTyping: false,
      abortController: null,
      isStreaming: false,
      showProfileModal: false,
      // Plan + daily usage shown in the profile modal (GET /api/ai/usage-status).
      usage: null,
      usageLoading: false,
      localUser: null,
      loadingUserData: false,
      editingSessionId: null,
      userLocation: null,
      locationPermission: localStorage.getItem('locationPermission') || 'unknown',
      isRequestPending: false,
      showAllHours: false,
      nearbyMode: false,
      // Transient text shown in the input placeholder right after the user
      // toggles Nearby/Discovery, then it reverts to the normal placeholder.
      modeSwitchNotice: '',
      modeSwitchTimer: null,
      contextMenu: { sessionId: null, x: 0, y: 0 },
      // Live progress note from the engine's `stage` events — one stream at a
      // time, so one field is enough. Cleared when prose starts or the turn ends.
      engineStage: '',
      showInfoModal: false,
      selectedPlace: null,
      placeDetails: null,
      loadingPlaceDetails: false,
      showFullscreenModal: false,
      fullscreenImages: [],
      currentFullscreenIndex: 0,
      fullscreenLoading: false,
      isRequestingImages: false,
      imageRequestStates: new Map(),
      globalImageRequest: false,
      userHasScrolledUp: false,
      isAutoScrolling: false,
      lastScrollTime: 0,
      scrollCheckDebounce: null,
      streamingLampAnimatingIds: new Set(),
      SCROLL_THRESHOLD: this.isDesktop ? 4 : 2, // normal for mac to check scrolling
      AUTO_SCROLL_COOLDOWN: 80 ,
      usageStatus: null,
      usageCheckInterval: null,
      sessionHealth: {messageCount: 0, remainingMessages: 50, shouldWarn: false, warningDismissed: false},
      showSessionLimitModal: false,
      viewMoreAnimatingIds: new Set(),
      quickActions: [
        { id: 'restaurants', maxCount: 20, defaultCount: 8 },
        { id: 'hotels', maxCount: 15, defaultCount: 7 },
        { id: 'hidden_gems', maxCount: 12, defaultCount: 6 },
        { id: 'historical', maxCount: 15, defaultCount: 6 },
        { id: 'events', maxCount: 25, defaultCount: 10 },
        { id: 'photo_spots', maxCount: 15, defaultCount: 7 },
        // Activities: ONE chip with NO clarifier, deliberately unlike shopping.
        // The interests picked at onboarding do the narrowing, so a relaxation
        // user gets spas and a nightlife user gets bars from the same button
        // (V3 §10.2).
        { id: 'activities', maxCount: 15, defaultCount: 8 },
        // Shopping asks a follow-up ("what are you shopping for?") before
        // searching — `clarify: true` makes the button open the sub-type chips
        // instead of firing a search immediately.
        { id: 'shopping', maxCount: 15, defaultCount: 8, clarify: true },
        // Itinerary runs its own sequential clarifier (days -> hotel),
        // intercepted at the top of triggerQuickAction. No `clarify` flag
        // here (that one opens the shopping clarifier specifically).
        { id: 'itinerary' },
      ],
      // Sub-types offered after tapping Shopping. subType is sent to the
      // backend; labelKey localises the chip. Keep in sync with the
      // SHOPPING_PROMPTS map in aiRoutes.js generateTargetedPrompt().
      shoppingSubTypes: [
        { subType: 'souvenirs', labelKey: 'chat.shopping.souvenirs' },
        { subType: 'clothing',  labelKey: 'chat.shopping.clothing'  },
        { subType: 'market',    labelKey: 'chat.shopping.market'    },
        { subType: 'mall',      labelKey: 'chat.shopping.mall'      },
        { subType: 'jewelry',   labelKey: 'chat.shopping.jewelry'   },
        { subType: 'food',      labelKey: 'chat.shopping.food'      },
      ],
      // True while the shopping clarifier prompt is shown above the input box.
      showShoppingClarifier: false,
      // Itinerary setup is a small step-by-step flow above the input.
      // step: null (closed) | 'days' | 'hotel'. Destination is NOT asked —
      // it comes from the user's onboarding destination / effective location.
      itineraryStep: null,
      itineraryDraft: { daysCount: 3, hotelName: '', pickHotel: false, hotelBreakfast: false, tripBudgetTotal: null, people: 2 },
      // Briefly forces the preference bar closed so it can finish collapsing
      // before the shopping clarifier opens in the same slot (sequenced, not
      // simultaneous). See triggerQuickAction's clarify branch.
      barClosingForClarifier: false,
      // Auto-hide the preference bar a few seconds after it reveals.
      barAutoHidden: false,
      usageNotice: null,        // transient quota notice shown above the composer
      barAutoHideTimer: null,
      showSettingsModal: false,
      // Admin-only engine switch: 'v1' (production chat-stream) or 'v2' (the
      // parallel engine at /chat-stream-v2). Persisted locally so comparison
      // testing survives reloads. Applies to chat only — quick actions stay v1.
      // THE CUTOVER (2026-08-22, ~18:30): v2 becomes the default engine after
      // the battery re-runs passed (vegan/rooftops/events full pass, uzbek
      // honest with a cosmetic deck-size miss). A stored explicit choice wins
      // — the settings toggle stays as the instant rollback to v1.
      chatEngine: localStorage.getItem('jinni_chat_engine') || 'v2',
      settingsSaved: false,
      settingsSaveTimeout: null,
      userSettings: {
        language: 'en',
        theme: 'auto',
        location: { country: '', countryName: '', city: '', coordinates: { lat: 0, lng: 0 } },
        searchRadius: { nearby: 5, discovery: 50 },
        privacy: { autoDetectLocation: true, showDistances: true, locationPermissionGranted: false }
      },
      countryOptions: [],
      cityOptions: [],
      loadingCities: false,
      showLanguageDropdown: false,
      showFontDropdown: false,
      showCountryDropdown: false,
      showCityDropdown: false,    
      languageSearch: '',
      countrySearch: '',
      citySearch: '',    
      languageOptions: [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
        { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
        { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
      ],
      dangerConfirm: {deleteChats: { step: 0 }, deleteAccount: { step: 0, typedValue: '' }},
      // Saved Places
      savedPlacesOpen:    false,
      savedPlaces:        [],
      savedPlacesLoading: false,
      savedPlacesHasMore: false,
      savedPlacesCursor:  null,
      savedKeys:          new Set(),
      savingInProgress:   new Set(),
      // Feedback (like/dislike)
      messageFeedback:    {},   // { [message.id]: 'like' | 'dislike' | null }
      recFeedback:        {},   // { [rec stable key]: 'like' | 'dislike' | null }
      copiedMessageId:    null, // message.id of the recently copied message
      itinShareCopiedId:  null, // message.id whose itinerary share link was just copied (desktop fallback)
      sharedRecId:        null, // rec stable-key of the recently shared recommendation
      shareProgress: { active: false, current: 0, total: 0 },
      touchedMessageId:   null, // message.id of the user bubble tapped on mobile
      sessionBusinessIds: [],   // tracks all verified business IDs interacted with this session (for crossInteractions)
    };
  },
  computed: {
    /** "30 days left" / "until 5 Sep" — empty for free accounts and for
     *  grandfathered ones with no expiry (premiumUntil === null). */
    premiumExpiryLabel() {
      const u = this.usage;
      if (!u || !u.isPremium || !u.premiumUntil) return '';
      const days = u.premiumDaysRemaining;
      if (Number.isFinite(days) && days <= 30) {
        return this.t('profile.plan.days_left', { days });
      }
      const d = new Date(u.premiumUntil);
      if (Number.isNaN(d.getTime())) return '';
      return this.t('profile.plan.until', {
        date: d.toLocaleDateString(this.locale || undefined, { month: 'short', day: 'numeric' }),
      });
    },

    userPreferences() { return this.localUser?.preferences || {} },
    // Builds the chip list for the preference context bar. Only includes
    // preferences that are actually set, so the bar never shows empty slots.
    prefChips() {
      const p = this.userPreferences || {};
      const chips = [];
      if (p.interests && p.interests.length) {
        chips.push({ key: 'interests', label: p.interests.map(i => this.formatInterest(i)).join(', ') });
      }
      if (p.travelStyle) {
        chips.push({ key: 'style', label: this.formatTravelStyle(p.travelStyle) });
      }
      if (p.budget && (p.budget.min > 0 || p.budget.max > 0)) {
        chips.push({ key: 'budget', label: this.formatBudget(p.budget) });
      }
      const loc = this.userSettings && this.userSettings.location;
      if (loc && loc.city) {
        chips.push({ key: 'location', label: loc.countryName ? `${loc.city}, ${loc.countryName}` : loc.city });
      }
      return chips;
    },
    hasAnyPreference() { return this.prefChips.length > 0 },
    // Visibility for the preference bar. Hidden by default; revealed only on
    // intent — when the user starts typing, or opens the actions popover via
    // the mobile-toggle-inline button. Stays hidden while the shopping
    // clarifier is open, when no preferences are set, and for brand-new users
    // (empty chat with no other chat sessions) to keep the first run clean.
    // Intent-based reveal conditions (independent of the auto-hide timer).
    preferenceBarTriggered() {
      if (!this.hasAnyPreference) return false;
      if (this.showShoppingClarifier || this.barClosingForClarifier) return false;
      if (this.messages.length === 0 && this.chatSessions.length === 0) return false;
      return this.userInput.trim().length > 0 || this.showMobileActions;
    },
    showPreferenceBar() {
      return this.preferenceBarTriggered && !this.barAutoHidden;
    },
    // All translatable strings for <RecommendationMap>, spread onto each
    // instance via v-bind="mapLabels". Reactive to locale changes because t()
    // tracks the active locale, so switching language re-translates the map.
    mapLabels() {
      const t = this.t;
      // ORS turn-by-turn is only available for a fixed set of languages. Map the
      // UI locale to a supported ORS code; anything unsupported (e.g. Arabic —
      // ORS has no 'ar' instructions) falls back to English so the route request
      // still succeeds instead of erroring on an unknown language.
      const ORS_ROUTE_LANG = { en: 'en', fr: 'fr', ru: 'ru', zh: 'zh' };
      return {
        routeLanguage: ORS_ROUTE_LANG[this.locale] || 'en',
        showLabel: t('map.show'),
        hideLabel: t('map.hide'),
        openFullscreenLabel: t('map.open_fullscreen'),
        closeLabel: t('map.close'),
        locateTitle: t('map.my_location'),
        youAreHereLabel: t('map.you_are_here'),
        locationDeniedLabel: t('map.location_denied'),
        locationUnavailableLabel: t('map.location_unavailable'),
        locationUnsupportedLabel: t('map.location_unsupported'),
        locationApproxLabel: t('map.location_approx'),
        routeFromMeLabel: t('map.route_from_me'),
        clearRouteLabel: t('map.clear_route'),
        routingLabel: t('map.routing'),
        routeErrorLabel: t('map.route_error'),
        showRouteLabel: t('map.tap_for_distance'),
        modeCarLabel: t('map.mode_car'),
        modeWalkLabel: t('map.mode_walk'),
        modeCycleLabel: t('map.mode_cycle'),
        detailsLabel: t('map.details'),
        filterAllLabel: t('map.filter_all'),
        tierSignatureLabel: t('map.tier_signature'),
        tierSpotlightLabel: t('map.tier_spotlight'),
        tierVerifiedLabel: t('map.tier_verified'),
        exitRouteLabel: t('map.exit_route'),
        arriveLabel: t('map.arrived'),
        doneLabel: t('map.done'),
        uturnLabel: t('map.uturn'),
        wrongWayLabel: t('map.wrong_way'),
        wrongWayHint: t('map.wrong_way_hint'),
        directionsLabel: t('map.directions'),
        transitLabel: t('map.transit'),
        callLabel: t('map.call'),
        websiteLabel: t('map.website'),
        placeFallbackLabel: t('map.place_fallback'),
        unitKm: t('map.units.km'),
        unitMeter: t('map.units.m'),
        unitMinute: t('map.units.min'),
        unitHour: t('map.units.hour'),
      };
    },
    // Normalize each saved doc into a rec-shaped object so the saved panel can
    // reuse the real recommendation-card (tier glow, image request, etc.).
    savedRecs() { return (this.savedPlaces || []).map(save => ({ save, rec: this.savedToRec(save) })); },
    // Tier tint for the info modal. Only partners (verified / spotlight /
    // signature) get a tinted modal; generic Google results and destinations
    // keep the default glacier background. Mirrors getPartnerWrapperClass.
    // Parse each backend hours string ("Mon–Fri: 09:00–22:00") into a
    // day/time pair for a clean two-column schedule. Falls back to showing
    // the whole string as the "day" when there's no "day: time" separator.
    hoursParsed() {
      const hrs = this.placeDetails?.hours;
      if (!Array.isArray(hrs)) return [];
      return hrs.map(line => {
        const s = String(line);
        const idx = s.indexOf(': ');
        if (idx > 0) return { day: this._translateDayTokens(s.slice(0, idx).trim()), time: s.slice(idx + 2).trim() };
        return { day: this._translateDayTokens(s.trim()), time: '' };
      });
    },
    // Whichever of the two records actually carries the event's dates. The
    // modal used to read `placeDetails || selectedPlace`, and /place-details
    // returns a Google-shaped payload with no eventSchedule — so opening
    // "More" on an event showed an address and nothing else, even though the
    // card behind it displayed the date fine.
    infoEventSource() {
      if (this.placeDetails?.eventSchedule) return this.placeDetails;
      if (this.selectedPlace?.eventSchedule) return this.selectedPlace;
      return this.placeDetails || this.selectedPlace;
    },
    // Same reasoning for the ticket price the reader lifted off the listing.
    infoTicketPrice() {
      return this.placeDetails?.eventPrice || this.selectedPlace?.eventPrice || null;
    },
    infoTicketApprox() {
      return this.placeDetails?.eventPriceApprox || this.selectedPlace?.eventPriceApprox || null;
    },
    infoModalTierClass() {
      const rec = this.selectedPlace;
      if (!rec) return '';
      if (!rec.verifiedId && !(typeof rec.id === 'string' && rec.id.startsWith('db-'))) return '';
      if (rec._verifiedModel === 'destination') return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return 'info-modal--signature';
      if (tier === 'spotlight') return 'info-modal--spotlight';
      return 'info-modal--verified';
    },
    locationStatusText() {
      switch(this.locationPermission) {
        case 'granted' : return 'Location enabled';
        case 'denied' : return 'Location denied';
        case 'unavailable' : return 'Location unavailable';
        case 'timeout' : return 'Location timeout';
        default : return 'Location unknown';
      }
    },
    userName() { return this.localUser?.name || this.t('profile.default_name') },
    userBusinessId() {
      try {
        // 1. Freshly loaded profile from /auth/me — authoritative, present for
        //    every login method (manual, Google, setup-password).
        if (this.localUser?.businessId) return this.localUser.businessId;
        // 2. Stored user blob — written by the manual email/password login flow.
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (stored?.businessId) return stored.businessId;
        // 3. JWT payload — now carries businessId for Google / setup-password
        //    logins (which redirect with only a token, no response body).
        const token = localStorage.getItem('authToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload?.businessId) return payload.businessId;
        }
        return null;
      } catch { return null }
    },
    // Gates the engine toggle in settings: agency reviewers / normal users
    // must never wander into the V2 beta by accident. Checks ALL the places an
    // admin flag can live — the component user, the stored blob (which may
    // predate the isAdmin field for old logins), and the JWT payload itself
    // (the same source the router trusts for the Admin page).
    isAdminUser() {
      const yes = (u) => !!(u && (u.isAdmin || u.role === 'admin'));
      try { if (yes(this.localUser)) return true; } catch {}
      try { if (yes(JSON.parse(localStorage.getItem('user') || '{}'))) return true; } catch {}
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // JWT payloads are base64url — atob() chokes on '-'/'_' and missing
          // padding, so normalize before decoding or the check silently fails.
          const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
          return yes(JSON.parse(atob(padded)));
        }
      } catch {}
      return false;
    },
    userEmail() { return this.localUser?.email || '' },
    userAvatar() { return this.localUser?.avatar || null },
    activeSession() { return this.chatSessions.find(s => s.id === this.activeSessionId) },
    // Sidebar order: newest at the top, oldest at the bottom. We sort here (not
    // just rely on the API's initial order) so the list stays correct after local
    // mutations — creating a chat, renaming, or a save bumping updatedAt — without
    // needing a reload. Falls back to createdAt, then leaves order stable if both
    // are missing. Non-mutating (spread first) so we don't trigger reactivity loops.
    sortedSessions() {
      const ts = (s) => {
        const v = s.updatedAt || s.createdAt;
        const t = v ? new Date(v).getTime() : 0;
        return Number.isFinite(t) ? t : 0;
      };
      // Empty sessions are hidden EXCEPT the one the user is in right now
      // (founder 2026-09-01: after delete-all there was NO row at all —
      // the current chat must always be visible; stale empty duplicates
      // still never pile up).
      return [...this.chatSessions]
        .filter(s => (s.messages?.length || 0) > 0 || s.id === this.activeSessionId)
        .sort((a, b) => ts(b) - ts(a));
    },
    isNightTime() { return isNightTime() },
    currentTheme() {
      if (this.userSettings.theme === 'light') return 'day-mode';
      if (this.userSettings.theme === 'dark') return 'night-mode';
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    // Translated labels handed to <ItineraryView>; omitted keys fall back to
    // the component's built-in English defaults.
    itineraryLabels() {
      return {
        planningTitle: this.t('chat.itinerary.planning'),
        loadingTitle: this.t('chat.itinerary.loading'),
        findingHotelsTitle: this.t('chat.itinerary.finding_hotels'),
        stoppedMessage: this.t('chat.itinerary.stopped'),
        day: this.t('chat.itinerary.day_cap'),
        // Per-slot like / dislike / save — reuse the chat card strings.
        like: this.t('chat.feedback.like'),
        dislike: this.t('chat.feedback.dislike'),
        save: this.t('chat.saved.save_place'),
        unsave: this.t('chat.saved.remove_saved'),
        addStop: this.t('chat.itinerary.add_stop'),
        regenerateDay: this.t('chat.itinerary.regenerate_day'),
        moveToDay: this.t('chat.itinerary.move_to_day'),
        fromSaved: this.t('chat.itinerary.from_saved'),
        noSavedNearby: this.t('chat.itinerary.no_saved_nearby'),
        stagePlanning: this.t('chat.itinerary.stage_planning'),
        stageEnriching: this.t('chat.itinerary.stage_enriching'),
        collecting: this.t('chat.itinerary.collecting'),
        retry: this.t('chat.itinerary.retry'),
        keep: this.t('chat.itinerary.keep'),
        moveUp: this.t('chat.itinerary.move_up'),
        moveDown: this.t('chat.itinerary.move_down'),
        replace: this.t('chat.itinerary.replace'),
        remove: this.t('chat.itinerary.remove'),
        viewPhoto: this.t('chat.itinerary.view_photo'),
        // Card overlay actions — reuse the chat card's own strings so the
        // itinerary cards read identically to every other recommendation card.
        more: this.t('chat.recommendations.more'),
        askAi: this.t('chat.recommendations.ask_ai'),
        notVerified: this.t('chat.itinerary.not_verified'),
        pickStop: this.t('chat.itinerary.pick_stop'),
        noCandidates: this.t('chat.itinerary.no_candidates'),
        genericError: this.t('chat.itinerary.generic_error'),
        approxPath: this.t('chat.itinerary.approx_path'),
        // Lowercase day words for the "{n} days" fallback in the header.
        dayWord: this.t('chat.itinerary.day'),
        daysWord: this.t('chat.itinerary.days'),
        // Map-related labels — reuse the EXISTING map.* translations.
        openFullscreen: this.t('map.open_fullscreen'),
        close: this.t('common.close'),
        driving: this.t('map.mode_car'),
        walking: this.t('map.mode_walk'),
        placeFallback: this.t('map.place_fallback'),
        unitKm: this.t('map.units.km'),
        unitMeter: this.t('map.units.m'),
        unitMinute: this.t('map.units.min'),
        unitHour: this.t('map.units.hour'),
        // Slot categories — reuse the EXISTING share-page category set
        // (identical wording to the component's English defaults).
        cat: {
          restaurants: this.t('share.itinerary.category.restaurants'),
          cafe:        this.t('share.itinerary.category.cafe'),
          hotels:      this.t('share.itinerary.category.hotels'),
          hidden_gems: this.t('share.itinerary.category.hidden_gems'),
          historical:  this.t('share.itinerary.category.historical'),
          museum:      this.t('share.itinerary.category.museum'),
          events:      this.t('share.itinerary.category.events'),
          photo_spots: this.t('share.itinerary.category.photo_spots'),
          viewpoint:   this.t('share.itinerary.category.viewpoint'),
          shopping:    this.t('share.itinerary.category.shopping'),
          activities:  this.t('share.itinerary.category.activities'),
          nature:      this.t('share.itinerary.category.nature'),
        },
        findReplacement: this.t('chat.itinerary.find_replacement'),
        pickReplacement: this.t('chat.itinerary.pick_replacement'),
        chooseHotel: this.t('chat.itinerary.choose_hotel'),
        skipHotel: this.t('chat.itinerary.skip_hotel'),
        breakfastQ: this.t('chat.itinerary.breakfast_q'),
        breakfastYes: this.t('chat.itinerary.breakfast_yes'),
        breakfastNo: this.t('chat.itinerary.breakfast_no'),
        details: this.t('chat.itinerary.details'),
        directions: this.t('chat.itinerary.directions'),
        transit: this.t('chat.itinerary.transit'),
        call: this.t('chat.itinerary.call'),
        website: this.t('chat.itinerary.website'),
        // Reuse the chat shopping clarifier strings for the itinerary add-stop flow.
        shopping: {
          prompt:    this.t('chat.shopping.prompt'),
          souvenirs: this.t('chat.shopping.souvenirs'),
          clothing:  this.t('chat.shopping.clothing'),
          market:    this.t('chat.shopping.market'),
          mall:      this.t('chat.shopping.mall'),
          jewelry:   this.t('chat.shopping.jewelry'),
          food:      this.t('chat.shopping.food'),
        },
      };
    },
    actionUsageStatus() {
      const status = {};
      this.quickActions.forEach(action => {
        const usage = this.getTotalActionUsage(action.id);
        const totalRecs = this.getTotalRecommendationsShown(action.id);
        status[action.id] = { usage, totalRecs, isNearLimit: usage >= 3 || totalRecs >= 20, isAtLimit: usage >= 4 || totalRecs >= 35 };
      });
      return status;
    },
    isOnCooldown() {
      if (this.usageStatus?.cooldown?.active) return true;
      // A daily-token/request limit returns 429 but has NO rolling cooldown window, so
      // `cooldown.active` gets flipped back to false by the next usage refresh — the ~1s
      // flash that let the user keep typing. Also lock when the daily budget is SPENT.
      // Check both sources: `usage` (the meter, updated from the 429's response headers,
      // so it's exhausted immediately) and `usageStatus`. `remaining`/`estimatedRemaining`
      // stay <=0 until the midnight-UTC reset, so the lock is stable and auto-clears then.
      for (const d of [this.usage?.daily, this.usageStatus?.daily]) {
        if (!d) continue;
        if (d.tokens && Number.isFinite(d.tokens.remaining) && d.tokens.remaining <= 0) return true;         // internal token budget
        if (d.requests && Number.isFinite(d.requests.estimatedRemaining) && d.requests.estimatedRemaining <= 0) return true;  // search/request count
        if (d.places && Number.isFinite(d.places.remaining) && d.places.remaining <= 0) return true;         // places-viewed cap (100/200)
      }
      return false;
    },
    cooldownEndTime() {
      if (!this.usageStatus?.cooldown?.active) return null;
      const cd = this.usageStatus.cooldown;
      // Prefer an explicit end timestamp; otherwise derive one from hoursRemaining,
      // which the mid-session / 429 cooldown paths set (they carry hours but not an
      // absolute time). Only fall back to "Unknown" when we truly have neither — so
      // the user sees a concrete reactivation time instead of a blank.
      let endTime = cd.until ? new Date(cd.until) : null;
      if ((!endTime || isNaN(endTime)) && cd.hoursRemaining) {
        endTime = new Date(Date.now() + cd.hoursRemaining * 60 * 60 * 1000);
      }
      if (endTime && !isNaN(endTime)) {
        return endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      return this.t('usage.cooldown.unknown_time');
    },
    cooldownMessage() {
      if (!this.isOnCooldown) return '';
      const endTime = this.cooldownEndTime;
      if (!this.isDesktop) { return endTime ? this.t('usage.cooldown.short', { time: endTime }) : this.t('chat.input.placeholder_mobile_cooldown') }      
      return endTime ? this.t('usage.cooldown.long', { time: endTime }) : this.t('usage.cooldown.soon');
    },
    filteredLanguages() {
      if (!this.languageSearch) return this.languageOptions;
      const search = this.languageSearch.toLowerCase();
      return this.languageOptions.filter(lang => lang.name.toLowerCase().includes(search) || lang.nativeName.toLowerCase().includes(search) || lang.code.toLowerCase().includes(search));
    },
    filteredCountries() {
      if (!this.countrySearch) return this.countryOptions;
      const search = this.countrySearch.toLowerCase();
      return this.countryOptions.filter(country => country.name.toLowerCase().includes(search) || country.code.toLowerCase().includes(search));
    },
    filteredCities() {
      if (!this.citySearch) return this.cityOptions;
      const search = this.citySearch.toLowerCase();
      return this.cityOptions.filter(city => city.name.toLowerCase().includes(search) || (city.stateCode && city.stateCode.toLowerCase().includes(search)));
    },
    shouldShowSessionWarning() { return this.sessionHealth.shouldWarn && !this.sessionHealth.warningDismissed },
    sessionWarningMessage() {
      // The user counts in EXCHANGES (their message + Jinni's reply), but messageCount /
      // remainingMessages count BOTH — so a 20-exchange chat reads as "40". Divide by 2
      // for display so the number matches what a human counts.
      const remaining = this.sessionHealth.remainingMessages;
      const toTurns = (n) => Math.max(0, Math.ceil((n || 0) / 2));
      if (remaining <= 0) { return this.t('chat.session.warning.message_limit') }
      if (remaining <= 6) { return this.t('chat.session.warning.message_remaining', { count: toTurns(remaining) }) }
      return this.t('chat.session.warning.message', { count: toTurns(this.sessionHealth.messageCount) });
    },
    MAX_INPUT_LENGTH() { return MAX_INPUT_LENGTH },
    canShare() { return !!navigator.share },
  },
  watch: {
    // Empty-chat greeting (re)appeared — new chat, or cleared session: fit
    // its box so the lamp+text pair centers (see _fitGreeting).
    'messages.length'(len) { if (len === 0) this.$nextTick(() => this._fitGreetingSoon()); },
    // Language switch redraws the greeting in a new tongue — new width.
    'userSettings.language'() { this.$nextTick(() => this._fitGreetingSoon()); },
    // When the preference bar reveals, auto-hide it after PREFERENCE_BAR_HIDE_MS.
    // A fresh reveal (e.g. reopening the actions popover or typing after
    // clearing) restarts it. 3s was not long enough to read the chips while
    // still composing a message.
    preferenceBarTriggered(revealed) {
      clearTimeout(this.barAutoHideTimer);
      this.barAutoHidden = false;
      if (revealed) {
        this.barAutoHideTimer = setTimeout(() => { this.barAutoHidden = true; }, PREFERENCE_BAR_HIDE_MS);
      }
    },
    'userSettings.language'(newLang) {
      this.locale = newLang;
      localStorage.setItem('jinni_language', newLang);
      document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', newLang);
    },
    messages: {
      handler(newMessages, oldMessages) {
        if (this.isMobile) {
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg?.sender === 'ai' && lastMsg?.streaming) {
            this.$nextTick(() => {
              const el = this.$refs.scrollContainer?.querySelector('.scrollable-content');
              if (el) el.scrollTop = el.scrollHeight;
            });
          }
          return; 
        }        
        if (JSON.stringify(newMessages) === JSON.stringify(oldMessages)) return;
        this.$nextTick(() => {
          this.updateScrollObserver();
          if (!this.userHasScrolledUp) this.scrollToBottom(false);
        });
      },
      deep: false,  
      flush: 'sync'
    }
  },
  created() {
    try {
      this.loadUser();
      this.initializeChat();
      const savedLang = this.userSettings.language || localStorage.getItem('jinni_language') || 'en';
      this.locale = savedLang;
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLang);
      this.axiosInterceptor = axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) this.handleTokenExpiration();
          return Promise.reject(error);
        }
      );
      const saved = localStorage.getItem('jinni_settings');
      if (saved) {
        try { this.userSettings = JSON.parse(saved) } 
        catch (e) { console.error('Failed to parse settings:', e) }
      }
    } catch (error) {console.error('❌ Error in created():', error)}
  },
  mounted() {
    this.checkScreenSize();
    this.$nextTick(() => this._fitGreetingSoon());
    try { document.fonts?.ready?.then(() => this._fitGreeting()); } catch (e) {}
    document.addEventListener('click', this.handlePlaceSearchClick);
    window.addEventListener('resize', this.checkScreenSize);
    this.setupPreferenceButtonHandler();
    setTimeout(() => { this.getCurrentLocation().catch(() => { console.log('Location not available on mount') }) }, 100);
    this.tokenCheckInterval = setInterval(() => { if (!this.isTokenValid()) { this.handleTokenExpiration() } }, 5 * 60 * 1000);
    setTimeout(() => { this.scrollToBottom(); }, 200);
    const savedNearbyMode = localStorage.getItem('nearbyMode');
    if (savedNearbyMode !== null) { this.nearbyMode = savedNearbyMode === 'true' }
    if (!this.isMobile) {
      setTimeout(() => {
        this.setupScrollListener();
        this.setupSmartScrollObserver();
      }, 100);
    }
    document.addEventListener('keydown', this.handleFullscreenKeyDown);
    window.addEventListener('location-updated', this.handleLocationUpdate);
    this.cleanOldImageCache();
    this.startUsageMonitoring();
    this.setupErrorHandling();
    this.applySettings();
    this.loadSettingsFromBackend();
    this.loadSavedPlaces(true).catch(() => {});
    this._clearTouchedMessage = (e) => {
      if (!e.target.closest('.message-bubble.user')) this.touchedMessageId = null;
    };
    document.addEventListener('touchstart', this._clearTouchedMessage, { passive: true });
    // iOS keyboard handling: when the keyboard opens, Safari shrinks only the
    // VISUAL viewport — the fixed 100vh chat shell keeps its layout height, so
    // the input bar could hide behind the keyboard, and Safari's "scroll the
    // focused field into view" push exposed the backdrop below the page.
    // Pinning the shell's height to visualViewport.height keeps the input bar
    // sitting right on top of the keyboard; scrollTo(0,0) cancels the push.
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && window.visualViewport) {
      this._vvHandler = () => {
        const vv = window.visualViewport;
        const el = document.querySelector('.genie-chat-container');
        if (!vv || !el) return;
        const keyboard = window.innerHeight - vv.height;
        if (keyboard > 60) {
          el.style.height = vv.height + 'px';
          window.scrollTo(0, 0);
          this.scrollToBottom();
          // The shrunk shell ends at vv.height; the strip from there to the
          // keyboard would otherwise show the body backdrop's MID-gradient
          // ("the upper color"). The fixed .kb-strip covers exactly that gap
          // in the page's own bottom tone.
          this.kbStripTop = Math.round(vv.height + vv.offsetTop);
        } else {
          el.style.height = '';
          this.kbStripTop = 0;
        }
      };
      window.visualViewport.addEventListener('resize', this._vvHandler);
      window.visualViewport.addEventListener('scroll', this._vvHandler);
    }
  },
  beforeUnmount() {
    if (this._vvHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this._vvHandler);
      window.visualViewport.removeEventListener('scroll', this._vvHandler);
    }
    this.closeContextMenu();   // clears the 5s timer + document click listener
    document.removeEventListener('click', this.handlePlaceSearchClick);
    clearTimeout(this._usageNoticeTimer);
    if (this.barAutoHideTimer) { clearTimeout(this.barAutoHideTimer) }
    if (this.tokenCheckInterval) { clearInterval(this.tokenCheckInterval) }
    axios.interceptors.response.eject(this.axiosInterceptor);
    window.removeEventListener('resize', this.checkScreenSize);
    document.removeEventListener('keydown', this.handleFullscreenKeyDown);
    document.removeEventListener('keydown', this.onInfoModalEsc, true);
    window.removeEventListener('location-updated', this.handleLocationUpdate);
    document.removeEventListener('touchstart', this._clearTouchedMessage);
    document.body.style.overflow = '';
    this.removeScrollListener();
    if (this.messageObserver) { this.messageObserver.disconnect() }
    if (this.scrollCheckDebounce) { clearTimeout(this.scrollCheckDebounce) }
    if (this.scrollObserver) { this.scrollObserver.disconnect() }
    if (this.axiosInterceptor) { axios.interceptors.response.eject(this.axiosInterceptor) }
    if (this.usageCheckInterval) { clearInterval(this.usageCheckInterval) }
  },
  methods: {
    // ── Events ────────────────────────────────────────────────────────────────
    //
    //   The chat surfaces event listings just like restaurants/hotels. The
    //   helpers below let the rec card and info-modal display the event's
    //   date/time and (defensively) flag ones that have already ended.
    //
    //   Timezone handling: an event's startDate/endDate are absolute UTC
    //   instants; they only mean a wall-clock time when paired with the
    //   event's home timezone (eventSchedule.timezone, e.g. "Europe/Moscow").
    //   The helpers below convert against that zone so a Moscow event reads
    //   as "20:00" to every traveler regardless of where they are. If a rec
    //   carries no timezone (legacy/cached data, or a Google-fallback rec),
    //   we fall back to UTC display — the same behaviour as before.
    //
    //   Note: the AI's discoverabilityFilter on the server already hides
    //   expired events from new recs. The _isExpired flag is for old chat
    //   history (recs generated before the event ended) and is computed on
    //   the server by formatBusinessDetails / the /place-details handler.
    isEventRec(rec) {
      if (!rec) return false;
      if (rec.eventSchedule) return true;
      // Fallback when we don't have eventSchedule but the category clearly
      // names an event. Covers legacy/cached recs and Google-fallback recs
      // that never went through formatBusinessDetails.
      const cat = String(rec.category || rec.type || '').toLowerCase();
      return cat === 'event' || cat === 'events';
    },
    // ── Event timezone helpers (shared by the three formatters below) ─────────
    // Wall-clock parts shown by `timeZone` for an absolute Date.
    _evZonedParts(date, timeZone) {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
      const p = {};
      for (const part of dtf.formatToParts(date)) {
        if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10);
      }
      if (p.hour === 24) p.hour = 0;
      return p;
    },
    // Absolute UTC value -> { y, mo, d, h, mi, weekday } in `timeZone`.
    // weekday is 0=Sun..6=Sat. Returns null for empty/invalid input.
    _evParts(value, timeZone) {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return null;
      const tz = timeZone || 'UTC';
      const p = this._evZonedParts(date, tz);
      // Weekday of the zoned calendar date — anchor via a UTC date so the host
      // timezone can't shift it.
      const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
      return { y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute, weekday };
    },
    // Short timezone label, e.g. "Europe/Moscow" -> "Moscow". Empty if no tz.
    _evTzLabel(tz) {
      if (!tz) return '';
      return (tz.split('/').pop() || tz).replace(/_/g, ' ');
    },
    // Short label for the rec card row right under the category line.
    // Examples:
    //   "Sat, May 16 · 20:00"           — one-time with start time
    //   "Sat, May 16 · All day"         — one-time, no times set
    //   "Sat, May 16 → Sun, May 17"     — multi-day
    //   "Weekly · every Sat"            — recurring (anchor day)
    //   ""                              — no schedule data available
    formatEventScheduleShort(rec) {
      const es = rec?.eventSchedule;
      if (!es?.startDate) return '';
      const tz = es.timezone || 'UTC';
      const start = this._evParts(es.startDate, tz);
      if (!start) return '';
      const pad = (n) => String(n).padStart(2, '0');
      const fmtDate = (p) => this._fmtEventDate(p);
      const fmtTime = (p) => `${pad(p.h)}:${pad(p.mi)}`;
      const isFillerStart = (p) => p.h === 0  && p.mi === 0;
      if (es.isRecurring) return `${this.t('chat.event.weekly')} · ${this.t('chat.event.every_day', { day: this._weekdayName(start.weekday, 'short') })}`;
      const end = this._evParts(es.endDate, tz);
      if (end) {
        const sameDay = start.y === end.y && start.mo === end.mo && start.d === end.d;
        if (!sameDay) return `${fmtDate(start)} → ${fmtDate(end)}`;
      }
      if (isFillerStart(start)) return `${fmtDate(start)} · ${this.t('chat.event.all_day')}`;
      return `${fmtDate(start)} · ${fmtTime(start)}`;
    },
    // Schedule label for the rec card's dedicated event row (sits below
    // rec-metadata). Returns { primary, secondary } so the template can put
    // the date on one line and the time on a second, de-emphasized line —
    // mirroring the info-modal layout but kept compact for the card.
    // Returns null when there's no schedule data to show.
    formatEventScheduleCard(rec) {
      const es = rec?.eventSchedule;
      if (!es?.startDate) return null;
      const tz = es.timezone || 'UTC';
      const start = this._evParts(es.startDate, tz);
      if (!start) return null;
      const pad = (n) => String(n).padStart(2, '0');
      const fmtDate = (p) => this._fmtEventDate(p);
      const fmtTime = (p) => `${pad(p.h)}:${pad(p.mi)}`;
      const isFillerStart = (p) => p.h === 0  && p.mi === 0;
      const isFillerEnd   = (p) => p.h === 23 && p.mi === 59;
      const tzTag = es.timezone ? ` (${this._evTzLabel(es.timezone)})` : '';

      if (es.isRecurring) {
        return { primary: this.t('chat.event.weekly'), secondary: this.t('chat.event.every_day', { day: this._weekdayName(start.weekday, 'short') }) };
      }
      const end = this._evParts(es.endDate, tz);
      const sameDay = end && start.y === end.y && start.mo === end.mo && start.d === end.d;
      const showStartTime = !isFillerStart(start);
      const showEndTime   = end && !isFillerEnd(end);

      if (end && !sameDay) {
        return { primary: `${fmtDate(start)} → ${fmtDate(end)}`, secondary: '' };
      }
      // single day (or no end date)
      if (!showStartTime && !showEndTime) {
        return { primary: fmtDate(start), secondary: this.t('chat.event.all_day') };
      }
      const s = showStartTime ? fmtTime(start) : '00:00';
      if (showEndTime) {
        return { primary: fmtDate(start), secondary: `${s} – ${fmtTime(end)}${tzTag}` };
      }
      return { primary: fmtDate(start), secondary: s + tzTag };
    },
    // Longer multi-line label for the info-modal. Returns an object with the
    // shape { primary, secondary, recurring } so the template can lay out
    // the two lines (or one) with separate styling.
    formatEventScheduleFull(rec) {
      const es = rec?.eventSchedule;
      if (!es?.startDate) return null;
      const tz = es.timezone || 'UTC';
      const start = this._evParts(es.startDate, tz);
      if (!start) return null;
      const pad = (n) => String(n).padStart(2, '0');
      const fmtDate = (p) => this._fmtEventDate(p, true);
      const fmtTime = (p) => `${pad(p.h)}:${pad(p.mi)}`;
      const isFillerStart = (p) => p.h === 0  && p.mi === 0;
      const isFillerEnd   = (p) => p.h === 23 && p.mi === 59;
      const tzTag = es.timezone ? ` (${this._evTzLabel(es.timezone)})` : '';

      if (es.isRecurring) {
        const everyDay = this.t('chat.event.every_day', { day: this._weekdayName(start.weekday, 'short') });
        return { primary: this.t('chat.event.weekly'), secondary: `${everyDay}, ${this.t('chat.event.starting', { date: fmtDate(start) })}`, recurring: true };
      }
      const end = this._evParts(es.endDate, tz);
      const sameDay = end && start.y === end.y && start.mo === end.mo && start.d === end.d;
      const showStartTime = !isFillerStart(start);
      const showEndTime   = end && !isFillerEnd(end);

      if (!end) {
        return { primary: fmtDate(start), secondary: showStartTime ? fmtTime(start) + tzTag : this.t('chat.event.all_day'), recurring: false };
      }
      if (sameDay) {
        if (!showStartTime && !showEndTime) return { primary: fmtDate(start), secondary: this.t('chat.event.all_day'), recurring: false };
        const s = showStartTime ? fmtTime(start) : '00:00';
        const e = showEndTime   ? fmtTime(end)   : '23:59';
        return { primary: fmtDate(start), secondary: `${s} – ${e}${tzTag}`, recurring: false };
      }
      const sb = showStartTime ? `${fmtDate(start)} · ${fmtTime(start)}` : fmtDate(start);
      const eb = showEndTime   ? `${fmtDate(end)} · ${fmtTime(end)}`     : fmtDate(end);
      return { primary: `${sb} → ${eb}${tzTag}`, secondary: '', recurring: false };
    },
    // ── Saved Places ──────────────────────────────────────────────────────────
    // Build a rec-shaped object from a saved doc so the saved panel can reuse
    // the real recommendation-card (tier glow, image-request, save toggle).
    savedToRec(saved) {
      const s = saved?.snapshot || {};
      return {
        name:        s.name,
        category:    s.category,
        type:        s.type,
        description: s.description,
        image:       s.image,
        address:     s.address,
        location:    s.location,
        distance:    s.distance,
        rating:      s.rating,
        latitude:    s.latitude  ?? null,
        longitude:   s.longitude ?? null,
        website:     s.website,
        partnerTier: s.partnerTier || null,
        eventSchedule: s.eventSchedule || null,
        _isExpired:  s._isExpired || false,
        verifiedId:  saved?.verifiedId || null,
        _verifiedModel: saved?.verifiedModel || null,
        placeId:     saved?.googlePlaceId || null
      };
    },
    getRecRef(rec) {
      if (rec.verifiedId) {return { verifiedId: rec.verifiedId, verifiedModel: rec._verifiedModel || null, googlePlaceId: null, key: rec.verifiedId }}
      if (rec.placeId) {return { verifiedId: null, verifiedModel: null, googlePlaceId: rec.placeId, key: rec.placeId }}
      return null;
    },
    isSaved(rec) {
      const ref = this.getRecRef(rec);
      return ref ? this.savedKeys.has(ref.key) : false;
    },
    async toggleSave(rec, event) {
      event?.stopPropagation();
      const ref = this.getRecRef(rec);
      if (!ref) return;
      if (this.savingInProgress.has(ref.key)) return;
      this.savingInProgress.add(ref.key);
      try {
        if (this.isSaved(rec)) {
          const match = this.savedPlaces.find(s =>
            (ref.verifiedId    && s.verifiedId?.toString()  === ref.verifiedId)  ||
            (ref.googlePlaceId && s.googlePlaceId            === ref.googlePlaceId)
          );
          if (!match) return;
          const response = await fetch(`${API_BASE_URL}/api/saves/${match._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          });
          if (response.ok) {
            this.savedKeys.delete(ref.key);
            this.savedPlaces = this.savedPlaces.filter(s => s._id !== match._id);
          }
        } else {
          const snapshot = {
            name:        rec.name,
            category:    rec.category || rec.type,
            type:        rec.type     || null,
            description: rec.description   || '',
            image:       rec.image         || rec.cachedImageUrl || '',
            address:     rec.location      || '',
            location:    rec.region        || '',
            distance:    rec.distance      || '',
            rating:      rec.rating        || null,
            // Coordinates — so the itinerary "From saved" chooser can use the
            // place without a geocoding round-trip (legacy saves lack these).
            latitude:    Number.isFinite(rec.latitude)  ? rec.latitude  : null,
            longitude:   Number.isFinite(rec.longitude) ? rec.longitude : null,
            website:     rec.website       || '',
            partnerTier: rec.partnerTier   || null,
            // Event-specific. Stored on the snapshot so the saved-places
            // panel can show the event date/time without re-fetching.
            // Spread conditionally — non-events carry neither key.
            ...(rec.eventSchedule && { eventSchedule: rec.eventSchedule }),
            ...(rec._isExpired != null && { _isExpired: rec._isExpired })
          };
          const response = await fetch(`${API_BASE_URL}/api/saves`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            body: JSON.stringify({ verifiedId: ref.verifiedId, verifiedModel: ref.verifiedModel, googlePlaceId: ref.googlePlaceId, snapshot })
          });
          if (response.ok) {
            const data = await response.json();
            this.savedKeys.add(ref.key);
            this.savedPlaces.unshift(data.data);
          }
        }
      } catch (err) {console.error('toggleSave error:', err)} 
      finally {this.savingInProgress.delete(ref.key)}
    },
    async createShareSnapshot(payload) {
      try {
        // Stamp the creator's current UI language so the share page opens in it.
        const body = { language: this.locale, ...payload };
        const response = await fetch(`${API_BASE_URL}/api/share`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)});
        if (!response.ok) throw new Error('Failed to create share');
        const { token } = await response.json();
        return `https://jinni.travel/share/${token}`;
      } catch (err) {
        console.error('Share creation failed:', err);
        return null;
      }
    },
    async loadSavedPlaces(reset = false) {
      if (this.savedPlacesLoading) return;
      if (reset) { this.savedPlaces = []; this.savedPlacesCursor = null; this.savedPlacesHasMore = false; }
      this.savedPlacesLoading = true;
      try {
        const params = new URLSearchParams({ limit: 20 });
        if (this.savedPlacesCursor) params.set('before', this.savedPlacesCursor);
        const response = await fetch(`${API_BASE_URL}/api/saves?${params}`, {headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }});
        const data = await response.json();
        if (data.success) {
          this.savedPlaces        = reset ? data.data : [...this.savedPlaces, ...data.data];
          this.savedPlacesHasMore = data.pagination.hasMore;
          this.savedPlacesCursor  = data.pagination.nextCursor;
          this.savedPlaces.forEach(s => {
            const key = s.verifiedId?.toString() || s.googlePlaceId;
            if (key) this.savedKeys.add(key);
          });
        }
      } catch (err) {
        console.error('loadSavedPlaces error:', err);
      } finally {
        this.savedPlacesLoading = false;
      }
    },
    async openSavedPlaces() {
      this.savedPlacesOpen = true;
      this.closeProfileMenu();
      await this.loadSavedPlaces(true);
    },
    closeSavedPlaces() { this.savedPlacesOpen = false; },
    async unsaveFromPanel(saved) {
      if (this.savingInProgress.has(saved._id)) return;
      this.savingInProgress.add(saved._id);
      try {
        const response = await fetch(`${API_BASE_URL}/api/saves/${saved._id}`, {method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }});
        if (response.ok) {
          const key = saved.verifiedId?.toString() || saved.googlePlaceId;
          if (key) this.savedKeys.delete(key);
          this.savedPlaces = this.savedPlaces.filter(s => s._id !== saved._id);
        }
      } catch (err) {console.error('unsaveFromPanel error:', err)} 
      finally {this.savingInProgress.delete(saved._id)}
    },
    // ── End Saved Places ──────────────────────────────────────────────────────
    // ── Feedback (like / dislike) ─────────────────────────────────────────────
    getRecFeedbackKey(rec) {return rec.verifiedId || rec.placeId || rec.id || rec.name},
    getRecFeedback(rec) {return this.recFeedback[this.getRecFeedbackKey(rec)] || null},
    // Cross-chat highlight: ask the backend for THIS user's prior like/dislike on
    // the given recs' places and merge into recFeedback so a place voted on in a
    // different chat shows its highlight here too. Per-place (collapsed across
    // actions) by design. Never clobbers a vote the user just made in THIS session
    // (local recFeedback wins) and fails silently — the highlight is cosmetic.
    async hydrateVotesForRecs(recs) {
      try {
        if (!Array.isArray(recs) || !recs.length) return;
        // A vote is stored under the SAME id the feedback carried: verifiedId for
        // DB places, else the Google placeId. So to find a rec's prior vote we must
        // look up by that same id. Collect both candidate ids per rec and send the
        // union; the backend matches either. (Earlier this only sent placeId, so
        // votes on database-backed places — stored under verifiedId — were never
        // found and the card rendered blank.)
        const lookupIds = [...new Set(
          recs.flatMap(r => [r && r.verifiedId, r && r.placeId]).filter(Boolean)
        )];
        if (!lookupIds.length) return;
        const res = await fetch(`${API_BASE_URL}/api/ai/my-votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ placeIds: lookupIds })
        });
        if (!res.ok) return;
        const { votes } = await res.json();
        if (!votes) return;
        // Merge: resolve each rec's vote by the SAME composite id used to store it
        // (verifiedId first, then placeId), and write it under the rec's display
        // key. Never overwrite a vote the user already made locally this session.
        // Build the additions first, then commit with a fresh object assignment so
        // Vue's reactivity fires and the cards re-render IMMEDIATELY — mutating
        // recFeedback[key] in place does not reliably trigger an update, which is
        // why the highlight previously only appeared after a manual page refresh.
        const additions = {};
        for (const rec of recs) {
          if (!rec) continue;
          const voteId = rec.verifiedId || rec.placeId;
          if (!voteId) continue;
          const v = votes[voteId];
          if (!v) continue;
          const key = this.getRecFeedbackKey(rec);
          if (this.recFeedback[key] == null) {
            additions[key] = v;
            if (rec.feedback == null) rec.feedback = v; // so a later save persists it
          }
        }
        if (Object.keys(additions).length) {
          // New object reference → reactive update; existing local votes win.
          this.recFeedback = { ...additions, ...this.recFeedback };
          this.$forceUpdate();
        }
      } catch (_) { /* cosmetic — ignore */ }
    },
    toggleRecFeedback(rec, vote, event, message) {
      event?.stopPropagation();
      const key = this.getRecFeedbackKey(rec);
      const newValue = this.recFeedback[key] === vote ? null : vote;
      this.recFeedback[key] = newValue;
      // Persist into the rec object so saveCurrentSession picks it up
      if (message) {
        const msg = this.messages.find(m => m.id === message.id);
        const r = msg?.recommendations?.find(r => this.getRecFeedbackKey(r) === key);
        if (r) r.feedback = newValue;
      }
      // Fire-and-forget — UI already updated, never block on this
      fetch(`${API_BASE_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          type: 'recommendation',
          sessionId: this.activeSessionId,
          messageId: message?.id,
          feedback: newValue,
          recId: rec.id,
          verifiedId: rec.verifiedId || null,
          placeId: rec.placeId || null,
          action: rec._action || null,
          // Denormalized name for PlaceFeedback — lets the chat-stream tell the
          // model which places to avoid/prefer by name, and suppress a disliked
          // place's card while it streams (before its placeId is resolved).
          name: rec.name || ''
        })
      }).catch(() => {}); // silently ignore network errors
    },
    getMessageFeedback(message) {return this.messageFeedback[message.id] || null},
    toggleMessageFeedback(message, vote) {
      const newValue = this.messageFeedback[message.id] === vote ? null : vote;
      this.messageFeedback[message.id] = newValue;
      // Persist into the message object so saveCurrentSession picks it up
      const msg = this.messages.find(m => m.id === message.id);
      if (msg) msg.feedback = newValue;
      // Fire-and-forget — UI already updated, never block on this
      fetch(`${API_BASE_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          type: 'message',
          sessionId: this.activeSessionId,
          messageId: message.id,
          feedback: newValue
        })
      }).catch(() => {}); // silently ignore network errors
    },
    // ── End Feedback ──────────────────────────────────────────────────────────
    // ── Copy / Share ──────────────────────────────────────────────────────────
    // Strip emojis / pictographs (incl. skin-tone modifiers, ZWJ sequences,
    // flags, keycaps and stray variation selectors) so copied text is plain
    // prose — the rendered chat keeps its emojis, only the clipboard is cleaned.
    stripEmojis(text) {
      if (!text) return '';
      let out = String(text);
      try {
        // Whole emoji sequences first (👩🏽‍💻, 1️⃣, 🇫🇷 …), then leftovers.
        out = out.replace(/\p{Extended_Pictographic}(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?)*/gu, '');
        out = out.replace(/[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0E\uFE0F\u200D\u20E3]/gu, '');
      } catch (_) {
        // Engines without Unicode property escapes — cover the common blocks.
        out = out.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0E\uFE0F\u200D\u20E3]/gu, '');
      }
      // Tidy the holes the emojis left behind.
      return out.replace(/[ \t]{2,}/g, ' ').replace(/ +([.,!?;:])/g, '$1');
    },
    // Markdown → clean plain text for the clipboard: drops **bold**/_italic_/
    // `code` markers, # headers, links → their label, internal rec markers,
    // and emojis; normalizes bullets to "- " and collapses extra blank lines.
    markdownToPlain(text) {
      if (!text) return '';
      // Drop the internal "**Name** → …←" rec markers (mirrors renderMessage()).
      let src = String(text).replace(/\*\*([^*]+)\*\*\s*→\s*[^←]+←/g, '');
      src = this.stripEmojis(src);
      const out = [];
      let inCode = false;
      for (const rawLine of src.split('\n')) {
        const trimmed = rawLine.trim();
        if (trimmed.startsWith('```')) { inCode = !inCode; continue; }
        if (inCode) { out.push(rawLine); continue; }
        if (!trimmed) { out.push(''); continue; }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { out.push(''); continue; } // hr
        let line = trimmed.replace(/^#{1,6}\s+/, ''); // headers → plain line
        // Bullets → "- ", numbered lists keep their numbers.
        let prefix = '';
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
        if (bullet) { prefix = '- '; line = bullet[1]; }
        else if (numbered) { prefix = `${numbered[1]}. `; line = numbered[2]; }
        line = line
          .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // images
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // links → label
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/__([^_]+)__/g, '$1')
          .replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,!?;:])/g, '$1$2')
          .replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?;:])/g, '$1$2')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/[ \t]{2,}/g, ' ')
          .trim();
        if (line) out.push(prefix + line);
      }
      return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    },
    // One rec card as a clean text block (name — category, event schedule,
    // description, address, distance). Mirrors what the card shows visually.
    recPlainText(rec) {
      if (!rec || !rec.name) return '';
      const lines = [];
      const category = rec.category || rec.type;
      lines.push(category ? `${rec.name} — ${category}` : rec.name);
      try {
        const sched = typeof this.isEventRec === 'function' && this.isEventRec(rec) && this.formatEventScheduleCard(rec);
        if (sched && sched.primary) lines.push(sched.secondary ? `${sched.primary}, ${sched.secondary}` : sched.primary);
      } catch (_) { /* schedule is decoration — never block the copy */ }
      // Some backends echo the place name into description (ordinary cards) —
      // skip any line that merely repeats the name so it isn't printed twice.
      const norm = (s) => this.stripEmojis(String(s)).replace(/\s+/g, ' ').trim().toLowerCase();
      const nameNorm = norm(rec.name);
      const pushUnlessName = (val) => {
        if (!val) return;
        const clean = this.stripEmojis(String(val)).replace(/\s+/g, ' ').trim();
        if (clean && norm(clean) !== nameNorm) lines.push(clean);
      };
      pushUnlessName(rec.description);
      pushUnlessName(rec.address || rec.location);
      if (rec.distance) lines.push(String(rec.distance).trim());
      return lines.filter(Boolean).join('\n');
    },
    // Whole itinerary as clean text: title, then each day with its numbered
    // slots (time — place name (category), indented note). Mirrors the
    // ItineraryView data shape: days[] → { dayNumber, title, slots[] } and
    // each slot → { time, category, note, status, name, place: { name, region } }.
    itineraryPlainText(itinerary) {
      if (!itinerary || !Array.isArray(itinerary.days) || !itinerary.days.length) return '';
      const lines = [];
      const title = itinerary.title || itinerary.destination?.name;
      if (title) { lines.push(this.stripEmojis(String(title)).trim()); lines.push(''); }
      const dayWord = this.t('chat.itinerary.day_cap') || 'Day';
      const days = [...itinerary.days].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
      days.forEach((day, i) => {
        const dayNum = day.dayNumber || i + 1;
        const dayTitle = day.title ? this.stripEmojis(String(day.title)).trim() : '';
        lines.push(dayTitle ? `${dayWord} ${dayNum} — ${dayTitle}` : `${dayWord} ${dayNum}`);
        (day.slots || []).forEach((slot, j) => {
          // Enriched slots carry the verified place; failed/pending ones only
          // have the AI's proposed name — use whichever exists.
          const name = (slot.place && slot.place.name) || slot.name || '';
          if (!name) return;
          const time = slot.time ? `${slot.time} — ` : '';
          const cat = slot.category ? ` (${slot.category})` : '';
          lines.push(`  ${j + 1}. ${time}${this.stripEmojis(String(name)).trim()}${cat}`);
          if (slot.place && slot.place.region) lines.push(`     ${this.stripEmojis(String(slot.place.region)).trim()}`);
          if (slot.note) lines.push(`     ${this.stripEmojis(String(slot.note)).replace(/\s+/g, ' ').trim()}`);
        });
        lines.push('');
      });
      return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    },
    getMessagePlainText(message) {
      const blocks = [];
      // 0. Itinerary messages — the content lives inside the mounted
      //    <ItineraryView>, not in text parts, so build it from its live data.
      if (message.itineraryId || message.itineraryRequest) {
        const view = this._itinViews && this._itinViews[message.id];
        const itinText = this.itineraryPlainText(view && view.itinerary);
        if (itinText) blocks.push(itinText);
      }
      if (message.contentParts?.length) {
        // 1. contentParts (after streaming) — interleave text and rec cards
        //    in display order so the copy mirrors what's on screen.
        for (const part of message.contentParts) {
          if (part.type === 'text') {
            const t = this.markdownToPlain(part.content);
            if (t) blocks.push(t);
          } else if (part.type === 'recommendation') {
            const r = this.recPlainText(message.recommendations?.[part.index]);
            if (r) blocks.push(r);
          }
        }
      } else if (message.textSections?.length || (message.isChatRecommendation && message.recommendations?.length)) {
        // 2. Live/streaming interleaved structure (positions).
        const max = this.getMaxPosition(message);
        for (let pos = 0; pos < max; pos++) {
          const t = this.markdownToPlain(this.getTextAtPosition(message, pos));
          if (t) blocks.push(t);
          const r = this.recPlainText(this.getRecommendationAtPosition(message, pos));
          if (r) blocks.push(r);
        }
        const tail = this.markdownToPlain(message.currentText);
        if (tail) blocks.push(tail);
      } else {
        // 3. Legacy format — message.text (+ optional flat rec list).
        if (message.currentText?.trim()) {
          blocks.push(this.markdownToPlain(message.currentText));
        } else if (message.text) {
          blocks.push(this.markdownToPlain(String(message.text).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')));
        }
        if (message.sender === 'ai' && message.recommendations?.length) {
          for (const rec of message.recommendations) {
            const r = this.recPlainText(rec);
            if (r) blocks.push(r);
          }
        }
      }
      return blocks.filter(Boolean).join('\n\n').trim();
    },
    copyToClipboard(text) {
      // Modern API (requires HTTPS / secure context)
      if (navigator.clipboard?.writeText) {return navigator.clipboard.writeText(text)}
      // Legacy fallback for HTTP or WebView contexts
      return new Promise((resolve, reject) => {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(el);
        ok ? resolve() : reject(new Error('execCommand copy failed'));
      });
    },
    async copyMessage(message) {
      const text = this.getMessagePlainText(message);
      if (!text) return;
      try {
        await this.copyToClipboard(text);
        this.copiedMessageId = message.id;
        setTimeout(() => { this.copiedMessageId = null; }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    },
    async _triggerShare({ title, text, url }) {
      // navigator.share requires HTTPS + a real user-gesture call stack.
      // Passing `url` alongside `text` is required by many Android browsers
      // to actually open the share sheet (text-only often silently falls back).
      const canShare = typeof navigator.share === 'function';
      if (canShare) {
        try {
          const shareData = { title, text };
          // Always include a url — use the current page if none is provided
          shareData.url = url || window.location.href;
          await navigator.share(shareData);
          return true; // share sheet was opened
        } catch (err) {
          // AbortError = user dismissed the sheet — not an error we need to handle
          if (err.name !== 'AbortError') console.error('navigator.share failed:', err);
          return false;
        }
      }
      return false; // Web Share API not available (desktop)
    },
    async shareMessage(message) {
      // 1. Build base payload
      const payload = {
        type: 'message',
        message: this.getMessagePlainText(message),
        contentParts: message.contentParts || null,
        recommendations: [],
        theme: this.currentTheme
      };
      // 2. Enrich each recommendation with full details using batches
      const recommendations = message.recommendations || [];
      if (recommendations.length > 0) {
        this.shareProgress = { active: true, current: 0, total: recommendations.length };
        const BATCH_SIZE = 3;
        const BATCH_DELAY = 150; // ms between batches
        const enrichedRecs = [];
        const enrichOne = async (rec) => {
          let detailId = rec.verifiedId || null;
          if (!detailId && rec.id && typeof rec.id === 'string' && rec.id.startsWith('db-')) {
            const candidate = rec.id.split('-').find(p => /^[a-f0-9]{24}$/i.test(p));
            if (candidate) detailId = candidate;
          }
          if (!detailId) detailId = rec.placeId;
          if (!detailId) {
            this.shareProgress.current++;
            return rec;
          }
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);
          try {
            const response = await fetch(`${API_BASE_URL}/api/ai/place-details/${detailId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
              signal: controller.signal
            });
            clearTimeout(timer);
            if (response.status === 429) {
              console.warn('Cooldown active, skipping enrichment for', rec.name);
              this.shareProgress.current++;
              return rec;
            }
            const result = await response.json();
            this.shareProgress.current++;
            if (result.success && result.data) {
              return {
                ...rec,
                phone: result.data.phone,
                website: result.data.website,
                email: result.data.email,
                pricing: result.data.pricing,
                highlights: result.data.highlights,
                socialMedia: result.data.socialMedia,
                hours: result.data.hours,
                description: result.data.description || rec.description,
                rating: result.data.rating || rec.rating,
                address: result.data.address || rec.address,
                // Keep the event schedule on shared event cards. Prefer the
                // fresh copy from place-details (carries the venue timezone).
                eventSchedule: result.data.eventSchedule || rec.eventSchedule || undefined,
                _isExpired: result.data._isExpired != null ? result.data._isExpired : (rec._isExpired || false)
              };
            }
          } catch (err) {
            clearTimeout(timer);
            console.warn(`Failed or timed out enriching ${rec.name}:`, err.name === 'AbortError' ? 'timeout' : err);
            this.shareProgress.current++;
          }
          return rec;
        };
        try {
          // Process recommendations in batches
          for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
            const batch = recommendations.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(enrichOne));
            enrichedRecs.push(...results);
            if (i + BATCH_SIZE < recommendations.length) {
              await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
          }
          payload.recommendations = enrichedRecs;
        } catch (err) {
          // Unexpected batch failure (should rarely happen because enrichOne never rejects)
          console.error('Share enrichment failed:', err);
          this.shareProgress = { active: false, current: 0, total: 0 };
          return;
        }
        // Dismiss progress overlay after all enrichments
        this.shareProgress = { active: false, current: 0, total: 0 };
        await new Promise(r => setTimeout(r, 300)); // let overlay fade out
      } else {
        payload.recommendations = recommendations;
      }
      // 3. Create share snapshot and trigger share
      const shareUrl = await this.createShareSnapshot(payload);
      if (!shareUrl) return;
      // Track message share (non-blocking, no verifiedId — message-level event)
      try {
        fetch(`${API_BASE_URL}/api/ai/track-interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ verifiedId: null, placeName: null, interactionType: 'place_share' })
        }).catch(() => {});
      } catch (_) {}
      await this._triggerShare({title: 'Jinni AI conversation', text: `Check out this conversation from Jinni AI:`, url: shareUrl});
    },
    async shareItinerary(message) {
      // The mounted <ItineraryView> for this message holds the live, fully
      // enriched itinerary object in its data (see registerItineraryView). We
      // snapshot that whole object into the share; the /api/share endpoint
      // sanitises it down to a public, self-contained trip (no ids / userId).
      const view = this._itinViews && this._itinViews[message.id];
      const itinerary = view && view.itinerary;
      if (!itinerary || !(itinerary.days && itinerary.days.length)) {
        console.warn('shareItinerary: itinerary not ready yet');
        return;
      }
      const payload = { type: 'itinerary', itinerary, theme: this.currentTheme };
      const shareUrl = await this.createShareSnapshot(payload);
      if (!shareUrl) return;
      const title = itinerary.title || itinerary.destination?.name || 'My trip';
      // Mobile → native share sheet. Desktop (no Web-Share) → copy the link and
      // flash a "Copied" state, mirroring the copy-response button's UX.
      const opened = await this._triggerShare({ title, text: 'Check out this trip plan from Jinni:', url: shareUrl });
      if (!opened) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          this.itinShareCopiedId = message.id;
          setTimeout(() => { if (this.itinShareCopiedId === message.id) this.itinShareCopiedId = null; }, 2000);
        } catch (_) { /* clipboard blocked — nothing else to do */ }
      }
    },
    async shareRecommendation(rec, event) {
      // 1. Build base rec object
      const recData = {
        name: rec.name,
        category: rec.category || rec.type,
        description: rec.description,
        image: rec.image,
        address: rec.address || rec.location,
        rating: rec.rating,
        distance: rec.distance,
        latitude: rec.latitude,
        longitude: rec.longitude,
        verifiedId: rec.verifiedId,
        partnerTier: rec.partnerTier,
        // Event schedule travels with the share so the public share page can
        // show the event's date/time — the single most important fact for an
        // event. Carried as-is from the rec (it already includes the venue
        // timezone); refreshed below from /place-details if that returns one.
        // A frozen snapshot is intentional here: a share is "what I saw now",
        // and the link expires in 24h anyway, so we don't re-hydrate it.
        ...(rec.eventSchedule ? { eventSchedule: rec.eventSchedule } : {}),
        _isExpired: rec._isExpired || false,
        // Placeholders for details we will fetch
        phone: null,
        website: null,
        email: null,
        pricing: null,
        highlights: null,
        socialMedia: null,
        hours: null,
      };
      // 2. Determine the detail ID (same logic as showPlaceInfo)
      let detailId = recData.verifiedId;
      if (!detailId && rec.id && typeof rec.id === 'string' && rec.id.startsWith('db-')) {
        const candidate = rec.id.split('-').find(p => /^[a-f0-9]{24}$/i.test(p));
        if (candidate) detailId = candidate;
      }
      if (!detailId) detailId = rec.placeId;
      // 3. Fetch full details from the backend (only once)
      if (detailId) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${API_BASE_URL}/api/ai/place-details/${detailId}`, {headers: { Authorization: `Bearer ${token}` }});
          if (response.ok) {
            const result = await response.json();
            const details = result.data;
            // Merge fetched fields (overwrite nulls)
            Object.assign(recData, {
              phone: details.phone || null,
              website: details.website || null,
              email: details.email || null,
              pricing: details.pricing || null,
              highlights: details.highlights || null,
              socialMedia: details.socialMedia || null,
              hours: details.hours || null,
              description: details.description || recData.description,
              rating: details.rating || recData.rating,
              // Prefer the freshly-fetched event schedule (it is the most
              // current and carries the venue timezone); keep the rec's copy
              // as a fallback when place-details doesn't return one.
              eventSchedule: details.eventSchedule || recData.eventSchedule || undefined,
              _isExpired: details._isExpired != null ? details._isExpired : recData._isExpired,
            });
            if (recData.description && recData.description.trim().toLowerCase() === recData.name.trim().toLowerCase()) {recData.description = null}
            const noDescPatterns = ['no description', 'description not available', 'no details'];
            if (recData.description && noDescPatterns.some(p => recData.description.toLowerCase().includes(p))) {recData.description = null}
          }
        } catch (err) {console.warn('Could not fetch details for share', err)}
      }
      // 4. Create the share snapshot
      const payload = {type: 'recommendation', rec: {...recData, description: null}, theme: this.currentTheme};
      const shareUrl = await this.createShareSnapshot(payload);
      if (!shareUrl) return;
      // 5. Track the share interaction (non-blocking)
      if (rec.verifiedId || (rec.id && rec.id.startsWith('db-'))) {
        this.trackInteraction(rec, 'place_share');
      }
      // 6. Share the link
      await this._triggerShare({title: recData.name,  text: `${recData.name}\n${recData.category || ''}`,  url: shareUrl});
    },
    // ── End Copy / Share ──────────────────────────────────────────────────────
    async loadSettingsFromBackend() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          this.loadSettingsFromLocalStorage();
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/settings`, {headers: { Authorization: `Bearer ${token}` }});
        if (response.data.success) {
          this.userSettings = response.data.settings;
          // If the user just changed theme right before a reload (iOS toolbar
          // fix), trust that choice over the server for this one load — its own
          // save may still be in flight. One-shot: consume and clear the flag.
          const pendingTheme = sessionStorage.getItem('jinni_theme_pending');
          if (pendingTheme) {
            this.userSettings.theme = pendingTheme;
            sessionStorage.removeItem('jinni_theme_pending');
          }
          this.$store.dispatch('settings/setPreference', this.userSettings.theme);
          localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings));
          if (this.userSettings.location.country) { await this.loadCitiesForCountry(this.userSettings.location.country) }
          this.applySettings();
        }
      } catch (error) {
        console.error('Failed to load settings from backend:', error);
        this.loadSettingsFromLocalStorage();
      }
    },      
    /* A preference Jinni changed is saved server-side — but this screen does not
       read the server. userSettings, which renders the Preferences "Location"
       tile, comes entirely from localStorage.jinni_settings, and localUser only
       covers preferences. So the database said Dubai while the tile said
       Yerevan, indefinitely (Arsen 2026-08-24: "location has not been saved …
       i noticed in preferences page too").

       OnboardingPage.vue does not have this problem because it writes both
       localStorage keys itself right after saving. This does the same thing,
       from the server's copy rather than from a guess about what changed. */
    async syncUserAfterPrefChange() {
      try {
        await this.loadUser();
        const u = this.localUser;
        if (!u) return;
        if (u.settings) {
          this.userSettings = {
            ...this.userSettings,
            ...u.settings,
            location: { ...(this.userSettings?.location || {}), ...(u.settings.location || {}) },
            searchRadius: { ...(this.userSettings?.searchRadius || {}), ...(u.settings.searchRadius || {}) },
            privacy: { ...(this.userSettings?.privacy || {}), ...(u.settings.privacy || {}) },
          };
          localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings));
          this.applySettings();
        }
        // Onboarding reads this one, so a change made in chat must show there too.
        localStorage.setItem('user', JSON.stringify(u));
      } catch (err) { console.error('Failed to refresh after a preference change:', err) }
    },

    loadSettingsFromLocalStorage() {
      try {
        const saved = localStorage.getItem('jinni_settings');
        if (saved) { 
          this.userSettings = JSON.parse(saved);
          this.$store.dispatch('settings/setPreference', this.userSettings.theme);
          if (this.userSettings.location.country) { this.loadCitiesForCountry(this.userSettings.location.country) }
        } 
        else { this.userSettings = {language: 'en',theme: 'auto',location: { country: '', countryName: '', city: '', coordinates: { lat: 0, lng: 0 } },searchRadius: { nearby: 5, discovery: 50 },privacy: { autoDetectLocation: true, showDistances: true, locationPermissionGranted: false }} }
        this.applySettings();
      } catch (error) { console.error('Failed to load settings:', error) }
    },
    async loadCountries() {
      if (this.countryOptions.length > 0) return;      
      if (!this.isDesktop) {
        // console.log('📱 Mobile device - skipping country/city loading, use map selector');
        this.countryOptions = [];
        return;
      }      
      const cached = localStorage.getItem('jinni_countries');
      if (cached) {
        try {
          this.countryOptions = JSON.parse(cached);
          // console.log('✅ Desktop: Loaded countries from cache');
          return;
        } catch (e) { console.error('Cache parse failed:', e) }
      }      
      try {
        const { Country } = await import('country-state-city');
        this.countryOptions = Country.getAllCountries().map(country => ({code: country.isoCode, name: country.name, lat: parseFloat(country.latitude) || 0, lng: parseFloat(country.longitude) || 0}));
        localStorage.setItem('jinni_countries', JSON.stringify(this.countryOptions));
        // console.log('✅ Desktop: Loaded', this.countryOptions.length, 'countries from library');
      } catch (error) {
        console.error('❌ Desktop: Failed to load country library:', error);
        this.countryOptions = [
          { code: 'AM', name: 'Armenia', lat: 40.1792, lng: 44.4991 },
          { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
          { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
          { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
          { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
          { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674 },
          { code: 'ES', name: 'Spain', lat: 40.4637, lng: -3.7492 },
          { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 },
          { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 },
          { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 }
        ];
        // console.log('⚠️ Desktop: Using fallback country list');
      }
    },
    async saveSettings() {
      try {
        const token = localStorage.getItem('authToken');
        localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings));  
        this.applySettings();
        // console.log('🌐 About to send PATCH to:', `${API_BASE_URL}/api/settings`);
        if (token && this.isTokenValid()) {
          const response = await axios.patch(`${API_BASE_URL}/api/settings`,this.userSettings,{ headers: { Authorization: `Bearer ${token}` } });
          // console.log('✅ Backend response:', response.data);
          if (!response.data.success) throw new Error('Failed to save settings');
        }
        this.settingsSaved = true;
        clearTimeout(this.settingsSaveTimeout);
        this.settingsSaveTimeout = setTimeout(() => {this.settingsSaved = false}, 2000);
      } catch (error) {
        console.error('❌ Save settings error:', error);
        console.error('Error details:', {message: error.message,response: error.response?.data,status: error.response?.status,url: error.config?.url});
      }
    },
    async resetSettings() {
      try {
        const token = localStorage.getItem('authToken');
        if (token && this.isTokenValid()) {
          const response = await axios.put(`${API_BASE_URL}/api/settings/reset`,{},{ headers: { Authorization: `Bearer ${token}` } });
          if (response.data.success) {this.userSettings = response.data.settings}
        } else {
          this.userSettings = {
            language: 'en',
            theme: 'auto',
            location: {country: '', countryName: '', city: '', coordinates: { lat: 0, lng: 0 }},
            searchRadius: { nearby: 5, discovery: 50 },
            privacy: {autoDetectLocation: true,showDistances: true,locationPermissionGranted: false}
          };
        }
        localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings));
        this.applySettings();
        this.settingsSaved = true;
        setTimeout(() => { this.settingsSaved = false; }, 2000);
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    },    
    resolveTheme() {
      if (!this.userSettings || !this.userSettings.theme) { return 'auto' }
      if (this.userSettings.theme === 'auto') { return isNightTime() ? 'dark' : 'light' }
      return this.userSettings.theme;
    },  
    async loadCitiesForCountry(countryCode) {
      if (!this.isDesktop) {
        // console.log('📱 Mobile device - skipping city loading, use map selector');
        this.cityOptions = [];
        return;
      }
      this.loadingCities = true;  
      const cacheKey = `jinni_cities_${countryCode}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          this.cityOptions = JSON.parse(cached);
          // console.log(`✅ Desktop: Loaded ${this.cityOptions.length} cities from cache for ${countryCode}`);
          this.loadingCities = false;
          return;
        } catch (e) { console.warn('Cache parse failed:', e) }
      }  
      try {
        const { City } = await import('country-state-city');
        const cities = City.getCitiesOfCountry(countryCode);
        // console.log(`🏙️ Desktop: Loaded ${cities.length} cities from library for ${countryCode}`);
        this.cityOptions = cities.map(city => ({name: city.name, lat: parseFloat(city.latitude) || 0, lng: parseFloat(city.longitude) || 0, stateCode: city.stateCode})).sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(cacheKey, JSON.stringify(this.cityOptions));
      } catch (error) {
        console.error('Desktop: Failed to load cities from library:', error);
        this.cityOptions = [];
      } finally { this.loadingCities = false }
    },
    async geocodeCity(cityName) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(`${API_BASE_URL}/api/settings/geocode`,{ city: cityName, country: this.userSettings.location.country },{ headers: { Authorization: `Bearer ${token}` } });
        if (response.data.success) {
          this.userSettings.location.coordinates.lat = response.data.data.coordinates.lat;
          this.userSettings.location.coordinates.lng = response.data.data.coordinates.lng;
        }
      } catch (error) { console.error('Geocoding failed:', error) }
    },
    async getEffectiveLocation() {
      const coords = this.userSettings.location.coordinates;
      const hasValidSavedCoords = coords && coords.lat !== 0 && coords.lng !== 0;
      if (this.userSettings.privacy.autoDetectLocation && this.userSettings.privacy.locationPermissionGranted) {
        if (this.userLocation) {return { lat: this.userLocation.lat, lng: this.userLocation.lng, source: 'gps', accuracy: this.userLocation.accuracy }}
        const loc = await this.getCurrentLocation();
        if (loc) return { lat: loc.lat, lng: loc.lng, source: 'gps', accuracy: loc.accuracy };
      }
      if (hasValidSavedCoords) {return { lat: coords.lat, lng: coords.lng, source: 'settings', city: this.userSettings.location.city, country: this.userSettings.location.countryName }}
      return null;
    },     
    getSearchRadius() {
      const radiusKm = this.nearbyMode ? this.userSettings.searchRadius.nearby : this.userSettings.searchRadius.discovery;
      return radiusKm * 1000;
    },    
    async toggleLocationPermission(enabled) {
      this.userSettings.privacy.autoDetectLocation = enabled;
      if (enabled) {
        try {
          const location = await this.getCurrentLocation();
          if (location) { 
            this.userSettings.privacy.locationPermissionGranted = true;
            this.resetManualDestination();
          }
        } catch (error) {
          console.error('Location permission denied:', error);
          this.userSettings.privacy.autoDetectLocation = false;
          this.userSettings.privacy.locationPermissionGranted = false;
        }
      } else { this.userSettings.privacy.locationPermissionGranted = false }
      await this.saveSettings();
    },
    resetManualDestination() {
      this.userSettings.location = { country: '', countryName: '', city: '', coordinates: { lat: 0, lng: 0 } };
      this.cityOptions = [];
    },
    showSettings() {
      this.showProfileModal = false;
      this.showProfileMenu = false;
      this.showSettingsModal = true;
      if (this.countryOptions.length === 0) { this.loadCountries() }
    },
    showPreferences() {
      this.showProfileMenu = false;
      this.editPreferences();
    },
    closeSettings() { this.showSettingsModal = false },
    setChatEngine(engine) {
      this.chatEngine = engine === 'v2' ? 'v2' : 'v1';
      localStorage.setItem('jinni_chat_engine', this.chatEngine);
    },
    loadSettings() {
      try {
        const saved = localStorage.getItem('jinni_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          return {
            language: settings.language || 'en',
            theme: settings.theme || 'auto',
            country: settings.country || 'AM',
            currency: settings.currency || 'AMD',
            distanceUnit: settings.distanceUnit || 'km',
            searchRadius: settings.searchRadius || { nearby: 5, discovery: 50 },
            autoDetectLocation: settings.autoDetectLocation !== false,
            showDistances: settings.showDistances !== false
          };
        }
      } catch (error) { console.error('Failed to load settings:', error) }
      return null;
    },
    // Font style + text size (founder 2026-09-01). System font STACKS on
    // purpose: the app speaks 6 scripts — a webfont covers at best two and
    // throws the rest into mismatched fallback; system stacks render every
    // script with the OS's best face, instantly. Text size scales the ROOT
    // font-size so every rem-based measure in the app scales together (the
    // standard accessibility mechanism).
    applyDisplayPrefs() {
      // Shared util: app-wide (--app-font var + root font-size) so every
      // page follows, not just the chat. See src/utils/displayPrefs.js.
      applyDisplayPrefsGlobal(this.userSettings);
    },
    setDisplayPref(key, val) {
      this.userSettings[key] = val;
      try { localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings)); } catch (e) {}
      this.applyDisplayPrefs();
      // The auto-grow's inline height was computed at the OLD size/font and
      // sticks until the next send — the row looked "not fixed" right after
      // changing the setting (founder 2026-09-01). Re-measure now.
      this.resetTextareaHeight();
      this.$nextTick(() => { const t = this.$refs.chatInput; if (t && t.value) this.adjustTextareaHeight(); });
      this.$nextTick(() => this._fitGreetingSoon());
      this.saveSettings();
    },
    applySettings() {
      const theme = this.resolveTheme();
      // console.log('🎨 Applying theme:', theme); 
      document.documentElement.setAttribute('data-theme', theme);    
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
      this.applyDisplayPrefs();
    },
    getSearchRadius() {
      const radiusKm = this.nearbyMode ? this.userSettings.searchRadius.nearby : this.userSettings.searchRadius.discovery;    
      return radiusKm * 1000;
    },
    formatDistance(distanceKm) {
      if (!distanceKm || !this.userSettings.showDistances) return '';
      if (this.userSettings.distanceUnit === 'mi') {
        const miles = (distanceKm * 0.621371).toFixed(1);
        return `${miles} mi`;
      }
      return `${distanceKm.toFixed(1)} km`;
    },
    async setTheme(theme) {
      if (this.userSettings.theme === theme) return;   // no change → no reload
      this.userSettings.theme = theme;
      this.applySettings();
      this.$store.dispatch('settings/setPreference', theme);

      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {
        // iOS Safari only re-derives the toolbar tint on a fresh render, so we
        // reload. To make it INSTANT (no waiting on the network) and avoid the
        // post-reload backend fetch reverting the theme:
        //  1) write localStorage now (sync) → store seeds the right theme on the
        //     very first paint after reload, so the toolbar is correct immediately;
        //  2) stash the choice in sessionStorage → the startup loader honours it
        //     over the server for that one load (see loadSettingsFromBackend);
        //  3) fire the save with keepalive so it outlives the reload.
        localStorage.setItem('jinni_settings', JSON.stringify(this.userSettings));
        sessionStorage.setItem('jinni_theme_pending', theme);
        const token = localStorage.getItem('authToken');
        if (token && this.isTokenValid()) {
          fetch(`${API_BASE_URL}/api/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(this.userSettings),
            keepalive: true,
          }).catch(() => {});
        }
        location.reload();
        return;
      }
      // Desktop/Android update the chrome live — just save normally.
      this.saveSettings();
    },
    getLanguageFlag(langCode) {
      const lang = this.languageOptions.find(l => l.code === langCode);
      return lang ? lang.flag : '';
    },
    getLanguageName(langCode) {return this.t(`languages.${langCode}`) || langCode.toUpperCase()},
    getCountryFlag(countryCode) {
      if (!countryCode || countryCode.length !== 2) return '';
      const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    },
    toggleLanguageDropdown() {
      this.showLanguageDropdown = !this.showLanguageDropdown;
      if (this.showLanguageDropdown) {
        this.languageSearch = '';
        this.$nextTick(() => { this.$refs.languageSearchInput?.focus() });
      }
    },
    closeLanguageDropdown() {
      this.showLanguageDropdown = false;
      this.languageSearch = '';
    },
    selectLanguage(langCode) {
      this.userSettings.language = langCode;
      this.locale = langCode;
      localStorage.setItem('jinni_language', langCode);
      this.saveSettings();
      this.showLanguageDropdown = false;
    },
    toggleCountryDropdown() {
      this.showCountryDropdown = !this.showCountryDropdown;
      if (this.showCountryDropdown) {
        this.countrySearch = '';
        this.$nextTick(() => { this.$refs.countrySearchInput?.focus() });
      }
    },
    closeCountryDropdown() {
      this.showCountryDropdown = false;
      this.countrySearch = '';
    },
    selectCountry(country) {
      this.userSettings.privacy.autoDetectLocation = false;
      this.userSettings.privacy.locationPermissionGranted = false;
      this.userSettings.location.country = country.code;
      this.userSettings.location.countryName = country.name;
      this.userSettings.location.coordinates.lat = country.lat;
      this.userSettings.location.coordinates.lng = country.lng;
      this.userSettings.location.city = '';
      // console.log('🌍 Loading cities for:', country.code);
      this.loadCitiesForCountry(country.code);
      this.saveSettings();
      this.showCountryDropdown = false;
    },
    toggleCityDropdown() {
      if (!this.userSettings.location.country || this.loadingCities) return;
      if (this.userSettings.privacy.autoDetectLocation) {
        this.showGPSSettingsAlert();
        return;
      }
      this.showCityDropdown = !this.showCityDropdown;
      if (this.showCityDropdown) {
        this.citySearch = '';
        this.$nextTick(() => { this.$refs.citySearchInput?.focus() });
      }
    },
    closeCityDropdown() {
      this.showCityDropdown = false;
      this.citySearch = '';
    },
    showGPSSettingsAlert() { alert(this.t('settings.location_alert')) },
    selectCity(city) {
      this.userSettings.privacy.autoDetectLocation = false;
      this.userSettings.privacy.locationPermissionGranted = false;
      this.userSettings.location.city = city.name;
      this.userSettings.location.coordinates.lat = city.lat;
      this.userSettings.location.coordinates.lng = city.lng;
      this.saveSettings();
      this.showCityDropdown = false;
    },
    async togglePrivacyGPS() {
      const isTurningOffGPS = !this.userSettings.privacy.autoDetectLocation;
      if (isTurningOffGPS) {
        if (!this.userSettings.location.country) {
          const confirmTurnOff = confirm(this.t('settings.gps_confirm.turn_off'));
          if (!confirmTurnOff) return;
        }
      } else {
        const confirmTurnOn = confirm(this.t('settings.gps_confirm.turn_on'));
        if (!confirmTurnOn) return;
      }
      await this.toggleLocationPermission(!this.userSettings.privacy.autoDetectLocation);
    },
    openMapSelector() {
      this.showSettingsModal = false;    
      this.$router.push('/map-selector');
    },
    handleLocationUpdate(event) { this.loadSettingsFromBackend() },
    showDeleteChatsConfirm() {
      this.dangerConfirm.deleteChats.step = 1;
      this.dangerConfirm.deleteAccount.step = 0;
    },
    cancelDeleteChats() {this.dangerConfirm.deleteChats.step = 0},
    async executeDeleteAllChats() {
      this.dangerConfirm.deleteChats.step = 0;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(`${API_BASE_URL}/api/ai/chat-sessions/all`, {headers: { Authorization: `Bearer ${token}` }});
        if (response.data.success) {
          this.chatSessions = [];
          this.messages = [];
          this.activeSessionId = null;
          // Create a fresh empty session to land on. (Previously this called a
          // non-existent createNewChat(), which threw and was swallowed by the
          // catch — leaving the sidebar empty until a manual page refresh.)
          await this.startNewChat();
          this.closeSettings();
        }
      } catch (error) { console.error('Failed to delete all chats:', error) }
    },
    showDeleteAccountConfirm() {
      this.dangerConfirm.deleteAccount = { step: 1, typedValue: '' };
      this.dangerConfirm.deleteChats.step = 0;
    },
    cancelDeleteAccount() {this.dangerConfirm.deleteAccount = { step: 0, typedValue: '' }},
    async executeDeleteAccount() {
      if (this.dangerConfirm.deleteAccount.typedValue !== 'DELETE') return;
      this.dangerConfirm.deleteAccount = { step: 0, typedValue: '' };
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(`${API_BASE_URL}/api/ai/user/account`, {headers: { Authorization: `Bearer ${token}` }});
        if (response.data.success) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('jinni_settings');
          this.$router.push('/');
        }
      } catch (error) { console.error('Failed to delete account:', error) }
    },
    toggleProfileMenu(event) {
      if (!this.sidebarOpen) {
        this.showProfile();
        return;
      }
      event?.stopPropagation?.();
      this.showProfileMenu = !this.showProfileMenu;
    },
    closeProfileMenu() { this.showProfileMenu = false},
    goToContactUs() {
      this.showProfileMenu = false;
      this.$router.push('/contact');
    },
    goToExplore() {
      this.showProfileMenu = false;
      this.$router.push('/explore');
    },
    async switchToListing() {
      this.isSwitching = true;
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.$router.push('/business/dashboard');
    },
    toggleSidebar() {
      this.closeContextMenu();
      if (!this.isDesktop) { this.mobileSidebarOpen = !this.mobileSidebarOpen } 
      else { this.sidebarOpen = !this.sidebarOpen }      
      this.showProfileMenu = false;
    },
    handleOverlayClick() { this.closeContextMenu(); if (this.mobileSidebarOpen && !this.isDesktop) { this.mobileSidebarOpen = false } },
    toggleMobileActionsPopover(event) {
      this.showMobileActions = !this.showMobileActions;
      if (this.showMobileActions && event) {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const popover = document.querySelector('.mobile-actions-popover');
        if (popover) {
          this.$nextTick(() => {
            // When the preference bar is showing (mobile only), it sits just
            // above the input row, so lift the popover by the bar's measured
            // height to clear it. scrollHeight gives the bar's full target
            // height even mid open-animation. Desktop keeps the original gap.
            const bar = document.querySelector('.preference-bar');
            const barClearance = (!this.isDesktop && this.showPreferenceBar && bar) ? bar.scrollHeight : 0;
            const spacing = 8 + barClearance;
            popover.style.bottom = `${window.innerHeight - buttonRect.top + spacing}px`;
            popover.style.right = `${window.innerWidth - buttonRect.right}px`;
          });
        }
      }
    },
    closeMobileActionsPopover() { this.showMobileActions = false },
    async startNewChat() {
      const activeSession = this.activeSession;
      if (activeSession && activeSession.messages.length === 0) { 
        this.messages = [];
        return; 
      }
      // Empty = reusable, judged by COUNT only — the old title comparison
      // (s.title === localized "New Chat") went blind after a language
      // switch and piled up one empty session per language (founder catch,
      // 2026-09-01).
      const existingEmptySession = this.chatSessions.find(s => (s.messages?.length || 0) === 0);
      if (existingEmptySession) {
        // console.log(`✅ Reusing existing empty session: "${existingEmptySession.title}"`);
        await this.loadChatSession(existingEmptySession.id);
        if (!this.isDesktop) { this.mobileSidebarOpen = false }
        return;
      }
      this.messages = [];
      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/chat-sessions`, { title: this.t('chat.header.new_chat_title'), messages: [] }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        const newSession = { ...response.data, id: response.data._id, title: this.t('chat.header.new_chat_title') };
        this.chatSessions.unshift(newSession);
        this.activeSessionId = response.data._id;
        this.messages = [];
        if (!this.isDesktop) { this.mobileSidebarOpen = false }
        await this.saveCurrentSession();
      } catch (error) { console.error('Error creating new chat session:', error) }
    },
    async loadChatSession(sessionId) {
      if (this.activeSessionId) { await this.saveCurrentSession() }
      this.activeSessionId = sessionId;
      localStorage.setItem('lastActiveChatId', sessionId);
      const session = this.chatSessions.find(s => s.id === sessionId);
      if (session) {
        this.messages = session.messages.map(msg => ({...msg, isChatRecommendation: msg.isChatRecommendation || false, ...(msg.itineraryId && { streaming: false }), recommendations: (msg.recommendations || []).map(rec => ({...rec, description: rec.description || ''})), contentParts: msg.contentParts || []}));
        // Seed the dirty-check baseline: the freshly loaded state IS the
        // persisted state, so a save with no further edits is a no-op and
        // must not bump updatedAt.
        this.seedSavedSignature(sessionId, this.messages, session.title);
        // console.log(`✅ Loaded ${this.messages.length} messages from session (no API calls)`);
        // Rebuild feedback maps from restored messages
        this.messageFeedback = {};
        this.recFeedback = {};
        this.messages.forEach(msg => {
          if (msg.feedback) this.messageFeedback[msg.id] = msg.feedback;
          msg.recommendations?.forEach(rec => {
            if (rec.feedback) {
              const key = this.getRecFeedbackKey(rec);
              this.recFeedback[key] = rec.feedback;
            }
          });
        });
        // After rebuilding this session's own votes, also pull cross-chat votes so
        // a place rated elsewhere shows its highlight here too. Per message batch.
        this.messages.forEach(msg => {if (msg.recommendations?.length) this.hydrateVotesForRecs(msg.recommendations)});
        await this.checkSessionHealth();
      }
      if (!this.isDesktop) { this.mobileSidebarOpen = false }
    },
    openContextMenu(session, event) {
      event.preventDefault();
      this.closeContextMenu();
      const menuWidth = 150;
      const menuHeight = 96; // ~two buttons tall
      const margin = 10;
      let x;
      let y = event.clientY;
      if (this.isDesktop) {
        // desktop: anchor to the pointer (opens to the right), clamp if off-screen
        x = event.clientX;
        if (x + menuWidth > window.innerWidth) { x = window.innerWidth - menuWidth - margin }
      } else {
        // mobile: always show on the left side of the screen
        x = margin + 2;
      }
      // clamp vertically so it never runs off the bottom
      if (y + menuHeight > window.innerHeight) { y = window.innerHeight - menuHeight - margin }
      this.contextMenu = { sessionId: session.id, x: Math.max(margin, x), y: Math.max(margin, y) };
      /* The little rename/delete/close row must never linger: it previously
       * stayed open until explicitly cancelled — surviving clicks anywhere
       * else and even a sidebar close/reopen. Three exits now:
       *   • 5s of doing nothing → closes itself;
       *   • a click anywhere outside the row → closes (the row's own buttons
       *     use @click.stop, so their clicks never reach this listener);
       *   • the sidebar closing → closes (see toggleSidebar/handleOverlayClick).
       * The opener ⋮ also uses @click.stop, so the opening click can't
       * immediately re-close the menu it just opened. */
      clearTimeout(this._ctxMenuTimer);
      this._ctxMenuTimer = setTimeout(() => this.closeContextMenu(), 5000);
      if (!this._ctxMenuOutside) {
        this._ctxMenuOutside = () => this.closeContextMenu();
        document.addEventListener('click', this._ctxMenuOutside);
      }
    },
    toggleContextMenu(session, event) { if (this.contextMenu.sessionId === session.id) { this.closeContextMenu() } else { this.openContextMenu(session, event) } },
    closeContextMenu() {
      this.contextMenu.sessionId = null;
      clearTimeout(this._ctxMenuTimer);
      this._ctxMenuTimer = null;
      if (this._ctxMenuOutside) {
        document.removeEventListener('click', this._ctxMenuOutside);
        this._ctxMenuOutside = null;
      }
    },
    toggleEditSession(session) {
      this.closeContextMenu();
      this.editingSessionId = session.id;
      this.$nextTick(() => { if (this.$refs.titleInput && this.$refs.titleInput[0]) { this.$refs.titleInput[0].focus() } });
    },
    async saveSessionTitle(session) {
      this.editingSessionId = null;
      try { await axios.post(`${API_BASE_URL}/api/ai/save-chat-title`, { sessionId: session.id, title: session.title }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }) } 
      catch (error) { console.error('Error saving title:', error) }
    },
    deleteSession(sessionId) {
      this.closeContextMenu();
      this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
      axios.delete(`${API_BASE_URL}/api/ai/chat-sessions/${sessionId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).catch(error => {console.error('Failed to delete session from server:', error)});
      if (this.activeSessionId === sessionId) { if (this.chatSessions.length > 0) { this.loadChatSession(this.chatSessions[0].id) } else { this.startNewChat() } }
    },
    formatRelativeTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      if (diffInSeconds < 60) return this.t('time.just_now');
      if (diffInSeconds < 3600) return this.t('time.minutes_ago', { count: Math.floor(diffInSeconds/60) });
      if (diffInSeconds < 86400) return this.t('time.hours_ago', { count: Math.floor(diffInSeconds/3600) });
      if (diffInSeconds < 2592000) return this.t('time.days_ago', { count: Math.floor(diffInSeconds/86400) });
      return this.t('time.months_ago', { count: Math.floor(diffInSeconds/2592000) });
    },
    // Map the i18n locale code to a BCP-47 tag for Intl date formatting.
    _localeTag() {
      const map = { en: 'en-US', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', ar: 'ar' };
      return map[this.locale] || this.locale || 'en-US';
    },
    // Localized weekday name (0 = Sunday … 6 = Saturday). Built from a fixed
    // reference week so the result is purely the day name in the active locale.
    _weekdayName(weekdayIndex, style = 'short') {
      const ref = new Date(Date.UTC(2024, 0, 7 + weekdayIndex)); // 2024-01-07 = Sunday
      try {
        return new Intl.DateTimeFormat(this._localeTag(), { weekday: style, timeZone: 'UTC' }).format(ref);
      } catch { return ref.toUTCString().slice(0, 3); }
    },
    // Localized, idiomatically-ordered date string from {y, mo, d} parts.
    _fmtEventDate(p, withYear = false) {
      const ref = new Date(Date.UTC(p.y, p.mo - 1, p.d));
      const opts = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
      if (withYear) opts.year = 'numeric';
      try {
        return new Intl.DateTimeFormat(this._localeTag(), opts).format(ref);
      } catch { return `${p.mo}/${p.d}`; }
    },
    // Backend opening-hours strings arrive with English day tokens
    // ("Mon–Fri: 09:00–22:00"). Swap recognised English day words / common
    // status words for their localized equivalents so the schedule reads in
    // the active language.
    _translateDayTokens(str) {
      if (!str) return str;
      let out = String(str);
      const full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const abbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      full.forEach((name, idx) => { out = out.replace(new RegExp('\\b' + name + '\\b', 'g'), this._weekdayName(idx, 'long')); });
      abbr.forEach((name, idx) => { out = out.replace(new RegExp('\\b' + name + '\\b', 'g'), this._weekdayName(idx, 'short')); });
      out = out.replace(/\bDaily\b/g, this.t('time.daily'));
      out = out.replace(/\bClosed\b/gi, this.t('time.closed'));
      out = out.replace(/\bOpen 24 hours\b/gi, this.t('time.open_24h'));
      return out;
    },
    // Inline AI-message quick-action chips ("Open Settings", "Preferences")
    // are stored as English identifiers so handleQuickAction() can match on
    // them; this returns the localized label for display only.
    quickActionLabel(action) {
      const map = { 'Open Settings': 'chat.quick_actions.open_settings', 'Preferences': 'chat.quick_actions.preferences' };
      return map[action] ? this.t(map[action]) : action;
    },
    async showProfile() { 
      this.loadSettingsFromLocalStorage();
      await this.loadUser();
      this.showProfileModal = true;
      // Fetched on open rather than cached: the counters move with every
      // recommendation, so a stale number is worse than a brief spinner.
      this.loadUsage();
    },

    /* ── Plan & usage ─────────────────────────────────────────────────────
       Reads the SAME status object the backend enforces against, so what the
       user sees here is exactly what the limiter will do. Never throws into
       the UI: on failure the card falls back to a plain "unavailable" line
       and the plan badge still renders. */
    async loadUsage() {
      this.usageLoading = true;
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/usage-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (!res.ok) throw new Error(`usage-status ${res.status}`);
        const data = await res.json();
        // Guard the shape — an older backend may omit `requests`.
        if (data && data.daily && data.daily.places && data.daily.tokens) {
          if (!data.daily.requests) {
            data.daily.requests = { estimatedRemaining: 0, avgTokensPerRequest: 0 };
          }
          this.usage = data;
        } else {
          this.usage = null;
        }
      } catch (e) {
        console.error('Usage status failed:', e);
        this.usage = null;
      } finally {
        this.usageLoading = false;
      }
    },

    /* ── Live quota from response headers ────────────────────────────────
       Every AI/itinerary response carries X-Usage-* headers describing the
       caller's remaining budget. They were being set by the backend, dropped
       by the browser (CORS never exposed them) and, for itineraries, emitted
       to an event nobody listened for. Now they land here.

       This PATCHES the already-loaded usage object rather than refetching:
       the numbers arrive free with a response we already made, so spending a
       round trip to learn what we were just told would be wasteful. When the
       profile modal has never been opened there is nothing to patch and the
       modal's own fetch remains the source of truth. */
    applyUsageHeaders(headers) {
      if (!headers || typeof headers.get !== 'function' || !this.usage) return;
      const num = (name) => {
        const raw = headers.get(name);
        if (raw === null || raw === '') return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      };
      const placesViewed = num('X-Usage-Places-Viewed');
      const placesRemaining = num('X-Usage-Places-Remaining');
      const tokensUsed = num('X-Usage-Tokens-Used');
      const tokensRemaining = num('X-Usage-Tokens-Remaining');
      const requestsRemaining = num('X-Usage-Requests-Remaining');
      // A response with none of them (an error, or a route that does not
      // meter) must not blank the meters.
      if ([placesViewed, placesRemaining, tokensUsed, tokensRemaining, requestsRemaining].every(v => v === null)) return;

      const pct = (used, limit) => (limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0);
      const places = this.usage.daily.places;
      const tokens = this.usage.daily.tokens;

      if (placesViewed !== null) places.viewed = placesViewed;
      if (placesRemaining !== null) places.remaining = placesRemaining;
      // Trust the limit we already fetched; derive it only if the headers
      // imply a different one (e.g. the account was upgraded mid-session).
      if (placesViewed !== null && placesRemaining !== null) places.limit = placesViewed + placesRemaining;
      places.percentage = pct(places.viewed, places.limit);

      if (tokensUsed !== null) tokens.used = tokensUsed;
      if (tokensRemaining !== null) tokens.remaining = tokensRemaining;
      if (tokensUsed !== null && tokensRemaining !== null) tokens.limit = tokensUsed + tokensRemaining;
      tokens.percentage = pct(tokens.used, tokens.limit);

      if (requestsRemaining !== null) this.usage.daily.requests.estimatedRemaining = requestsRemaining;
    },

    /** Meter colour: calm until it matters, then amber, then red. */
    barClass(pct) {
      if (pct >= 90) return 'is-critical';
      if (pct >= 70) return 'is-warning';
      return '';
    },

    /* Where "Upgrade" goes. There is no pricing page in this app yet, and the
       only existing upgrade endpoint (POST /api/ai/upgrade-premium) grants
       premium WITHOUT taking payment — so this must never call it directly.
       Set VITE_SUBSCRIBE_URL to a checkout link, or create a /pricing route;
       until one of those exists the button explains itself instead of
       silently doing nothing. */
    goToSubscribe() {
      const url = import.meta.env.VITE_SUBSCRIBE_URL;
      if (url) {
        if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener');
        else this.$router.push(url);
        return;
      }
      const hasPricing = this.$router.getRoutes().some(r => r.path === '/pricing');
      if (hasPricing) { this.$router.push('/pricing'); return; }
      alert(this.t('profile.plan.upgrade_unconfigured'));
    },
    renderMessage(text, message) {
      if (!text) return '';      
      let cleanedText = text.replace(/\*\*([^*]+)\*\*\s*→\s*[^←]+←/g, '');
      return this.formatTextSegment(cleanedText);
    },
    formatTextSegment(text) {
      if (!text) return '';
      let cleanedText = text.replace(/\*\*([^*]+)\*\*\s*→\s*([^←]+)←/g, '');
      const lines = cleanedText.split('\n');
      let result = [];
      let inBulletGroup = false;
      let inNumberedGroup = false;
      let inCodeBlock = false;
      let codeBlockContent = [];
      let lastItemType = null;
      let previousIndentLevel = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed.startsWith('```')) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            codeBlockContent = [];
            inBulletGroup = false;
            inNumberedGroup = false;
            if (result.length > 0 && lastItemType !== 'break') { result.push('<br>') }
          } else {
            inCodeBlock = false;
            result.push(`<pre><code>${codeBlockContent.join('\n')}</code></pre>`);
            codeBlockContent = [];
            lastItemType = 'code';
          }
          continue;
        }        
        if (inCodeBlock) {
          codeBlockContent.push(line);
          continue;
        }
        if (!trimmed) {
          if (inBulletGroup || inNumberedGroup) {
            inBulletGroup = false;
            inNumberedGroup = false;
            previousIndentLevel = 0;
            if (result.length > 0) {
              result.push('<br>');
              lastItemType = 'break';
            }
          } else if (result.length > 0 && lastItemType === 'text') {
            result.push('<br>');
            lastItemType = 'break';
          }
          continue;
        }
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          let content = headerMatch[2];
          content = content.replace(/\*\*/g, '');
          if (result.length > 0 && lastItemType !== 'break' && lastItemType !== 'hr') { result.push('<br>') }
          result.push(`<h${Math.min(level + 2, 6)}>${content}</h${Math.min(level + 2, 6)}>`);
          inBulletGroup = false;
          inNumberedGroup = false;
          previousIndentLevel = 0;
          lastItemType = 'header';
          continue;
        }
        if (/^(\-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
          if (inBulletGroup || inNumberedGroup) {
            inBulletGroup = false;
            inNumberedGroup = false;
            previousIndentLevel = 0;
          }
          if (result.length > 0 && lastItemType !== 'break') { result.push('<br>') }
          result.push('<hr>');
          lastItemType = 'hr';
          continue;
        }
        if (/^>\s+/.test(trimmed)) {
          const content = trimmed.replace(/^>\s+/, '');
          if (result.length > 0 && lastItemType !== 'break') { result.push('<br>') }
          result.push(`<blockquote>${content}</blockquote>`);
          inBulletGroup = false;
          inNumberedGroup = false;
          previousIndentLevel = 0;
          lastItemType = 'blockquote';
          continue;
        }
        const indent = line.match(/^(\s*)/)[1].length;
        const isIndented = indent >= 2;
        if (/^\d+\.\s+/.test(trimmed)) {
          if (!inNumberedGroup && lastItemType !== 'header' && result.length > 0) { result.push('<br>') } 
          else if (inNumberedGroup && !isIndented && previousIndentLevel >= 2) { result.push('<br>') }
          inNumberedGroup = true;
          inBulletGroup = false;
          previousIndentLevel = indent;
          const content = trimmed.replace(/^(\d+\.\s+)/, '<strong>$1</strong>');
          const className = isIndented ? 'numbered-item indented' : 'numbered-item';
          result.push(`<div class="${className}">${content}</div>`);
          lastItemType = 'list';
          continue;
        }
        if (/^[•\-*]\s+/.test(trimmed)) {
          if (!inBulletGroup && lastItemType !== 'header' && result.length > 0) { result.push('<br>') } 
          else if (inBulletGroup && !isIndented && previousIndentLevel >= 2) { result.push('<br>') }
          inBulletGroup = true;
          inNumberedGroup = false;
          previousIndentLevel = indent;
          const content = trimmed.replace(/^[•\-*]\s+/, '');
          const className = isIndented ? 'bullet-item indented' : 'bullet-item';
          result.push(`<div class="${className}">• ${content}</div>`);
          lastItemType = 'list';
          continue;
        }
        if (/^\*\*(.+?)\*\*$/.test(trimmed) && trimmed.length < 100) {
          const content = trimmed.replace(/^\*\*(.+?)\*\*$/, '$1');
          const nextLine = lines[i + 1]?.trim();
          if (!nextLine || nextLine === '' || /^[•\-*\d]/.test(nextLine)) {
            if (result.length > 0 && lastItemType !== 'break' && lastItemType !== 'header') { result.push('<br>') }
            result.push(`<h3>${content}</h3>`);
            inBulletGroup = false;
            inNumberedGroup = false;
            previousIndentLevel = 0;
            lastItemType = 'header';
            continue;
          }
          result.push(`<strong>${content}</strong>`);
          lastItemType = 'text';
          continue;
        }
        if ((inBulletGroup || inNumberedGroup) && trimmed && !/^[•\-*\d]/.test(trimmed)) {
          const className = isIndented ? 'bullet-continuation indented' : 'bullet-continuation';
          result.push(`<div class="${className}">${trimmed}</div>`);
          lastItemType = 'list';
          continue;
        }
        if (inBulletGroup || inNumberedGroup) {
          inBulletGroup = false;
          inNumberedGroup = false;
          previousIndentLevel = 0;
          if (result.length > 0 && lastItemType !== 'break') { result.push('<br>') }
        }
        result.push(trimmed);
        lastItemType = 'text';
      }
      cleanedText = result.join('|||NL|||');
      let formatted = cleanedText;
      formatted = formatted.replace(/\b(Preferences?)\b/gi, '<button class="inline-preference-btn" onclick="window.openPreferences()">$1</button>');
      // Settings is a destination too. Jinni now names it for the things it
      // deliberately will not change itself — the search radii live on this
      // screen, not Preferences (Arsen 2026-08-26: "radius change is from
      // settings, not preferences") — so without this the one actionable word in
      // a refusal rendered as dead text. Case-sensitive on purpose: the backend
      // sends the screen name capitalised, and a lowercase "settings" in ordinary
      // prose is not a place to tap.
      formatted = formatted.replace(/\b(Settings)\b/g, '<button class="inline-preference-btn" onclick="window.openJinniSettings()">$1</button>');
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = this.linkifyPlaceNames(formatted);
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
      formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');
      // NOTE: '|' is excluded from every URL class — newlines are still the
      // |||NL||| marker at this stage, and letting '|' into a URL swallowed
      // the marker into the href (rendered as a literal <br> inside the link).
      formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)|]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      formatted = formatted.replace(/\[(https?:\/\/[^\s\]|]+)\]/g, '<a href="$1" target="_blank">$1</a>');
      formatted = formatted.replace(/(?<!href="|">|<code>)(https?:\/\/[^\s<>"()|]+)(?!<\/a>|<\/code>)/g, (match) => { return `<a href="${match}" target="_blank">${match}</a>` });
      formatted = formatted.replace(/\|\|\|NL\|\|\|/g, '<br>');
      formatted = formatted.replace(/(<br>){3,}/g, '<br><br>');
      return formatted;
    },
    /* ── Click-to-search place names ─────────────────────────────────────────
       When the AI answers in prose (no rec cards) it bolds place names, e.g.
       **Sky Bar Yerevan**. This turns those bolds into a dotted-underline
       "click to look it up" hint. Heuristic keeps it to name-like bolds and
       skips labels ("Important:") and sentences, so emphasis text is left
       alone. Rendered via v-html, so the click is handled by delegation. */
    linkifyPlaceNames(html) {
      // A bold becomes a click-to-search link ONLY when the BACKEND marked it
      // as a place name (invisible U+2063 prefix, added at the one moment the
      // pipeline KNOWS the bold is a verified place whose card was demoted to
      // prose). No frontend guessing: headings, emphasis and every other bold
      // are left exactly as written.
      return html.replace(/<strong>\u2063\s*([^<]{1,90}?)<\/strong>/g, (m, name) => {
        const t = name.trim();
        const enc = t.replace(/"/g, '&quot;');
        return `<strong class="place-search" data-place="${enc}" title="${this.t('chat.search_place') || 'Look up'}">${t}</strong>`;
      });
    },
    handlePlaceSearchClick(e) {
      const el = e.target.closest && e.target.closest('.place-search');
      if (!el) return;
      const name = el.getAttribute('data-place');
      if (!name) return;
      // Context = the DESTINATION this answer is about, NOT where the user is
      // standing. These click-to-search names are places the AI mentioned but
      // did NOT render as a card; appending the user's HOME city (e.g. Yerevan)
      // sent a Dubai place to the wrong country (aqua park in Armenia). Read the
      // city/country from a verified card in the SAME message — those carry the
      // real destination — and fall back to the bare name (a distinctive place
      // resolves on its own) rather than the home city. Near-me chats are handled
      // too: there the sibling cards are already in the user's own city.
      let ctx = '';
      const bubble = el.closest('.message-bubble');
      const locEl = bubble && bubble.querySelector('.rec-location');
      if (locEl && locEl.textContent) {
        const segs = locEl.textContent.split(/\s+-\s+|,\s*/).map(s => s.trim()).filter(Boolean);
        if (segs.length) ctx = segs.slice(-2).join(' ');   // e.g. "Dubai United Arab Emirates"
      }
      this.searchPlace(name, ctx);
    },
    searchPlace(name, ctx = '') {
      // Google MAPS search (not plain web) — drops the venue on the map with
      // photos, reviews, hours and directions, which is what a traveler wants.
      // `ctx` is the answer's destination (from a sibling card), so a bare
      // "Sky Bar" resolves in the RIGHT city; with no card context we send the
      // name alone rather than guessing the user's home location.
      // For plain web search instead, swap the URL for
      //   https://www.google.com/search?q=${q}
      const q = encodeURIComponent(ctx ? `${name} ${ctx}` : name);
      const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
      // window.open('_blank') — matches the app's other working map buttons and
      // reliably opens a NEW TAB. Null the opener for security (no reverse
      // tab-nabbing) without the 'noopener' feature string that popup-blocks.
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
    },
    setupPreferenceButtonHandler() {
      window.openPreferences = () => {this.editPreferences()};
      // The radius sliders live in the Settings modal, so a refusal that names
      // Settings has to be able to open it.
      window.openJinniSettings = () => {this.showSettings()};
    },
    handleImageError(event) {
      console.warn('Image failed to load:', event.target.src);
      event.target.style.display = 'none';
    },
    async showPlaceInfo(place) {
      if (this.isOnCooldown) {
        this.showCooldownMessage(this.usageStatus);
        return;
      }
      // Opening the detail modal IS the "watched" signal — the user deliberately
      // opened this place's full page, whether or not they click anything inside.
      try { this.trackInteraction(place, 'info_open'); } catch (e) {}
      console.log('🔍 [MORE BTN] place object:', JSON.stringify(place, null, 2));
      // verifiedId may be missing on old saved sessions — extract it from the id field
      // id format for DB records: "db-<24hexMongoId>-<index>"
      let resolvedVerifiedId = place.verifiedId || null;
      if (!resolvedVerifiedId && place.id && typeof place.id === 'string' && place.id.startsWith('db-')) {
        const candidate = place.id.split('-').find(p => /^[a-f0-9]{24}$/i.test(p));
        if (candidate) {
          resolvedVerifiedId = candidate;
          console.log('🔍 [MORE BTN] extracted verifiedId from id field:', resolvedVerifiedId);
        }
      }
      console.log('🔍 [MORE BTN] resolvedVerifiedId:', resolvedVerifiedId, '| placeId:', place.placeId);
      this.selectedPlace = place;
      this.showInfoModal = true;
      this.loadingPlaceDetails = true;
      // Esc closes the modal first (capture phase + stopPropagation), so when the
      // modal is open over the fullscreen map, Escape returns to the map instead of
      // closing the map out from under it.
      document.addEventListener('keydown', this.onInfoModalEsc, true);
      try {
        const detailId = resolvedVerifiedId || place.placeId;
        console.log('🔍 [MORE BTN] detailId used for fetch:', detailId);
        if (detailId) {
          const url = `${API_BASE_URL}/api/ai/place-details/${detailId}`;
          console.log('🔍 [MORE BTN] fetching:', url);
          const response = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
          console.log('🔍 [MORE BTN] response status:', response.status);
          if (response.status === 429) {
            const errorData = await response.json();
            console.error('🚫 Place details blocked - cooldown active');
            this.showCooldownMessage({ cooldown: { active: true, hoursRemaining: errorData.cooldownUntil ? Math.ceil((new Date(errorData.cooldownUntil) - new Date()) / (1000 * 60 * 60)) : 4, reason: errorData.reason } });
            this.closeInfoModal();
            return;
          }
          if (response.ok) {
            const result = await response.json();
            console.log('✅ [MORE BTN] result.data received:', JSON.stringify(result.data, null, 2));
            this.placeDetails = result.data;
          } else {
            console.warn('⚠️ [MORE BTN] response not ok, using fallback. Status:', response.status);
            this.setFallbackDetails(place);
          }
        } else {
          console.warn('⚠️ [MORE BTN] no detailId found — using fallback directly');
          this.setFallbackDetails(place);
        }
      } catch (error) {
        console.error('❌ [MORE BTN] fetch error:', error);
        this.setFallbackDetails(place);
      } finally { this.loadingPlaceDetails = false }
    },
    setFallbackDetails(place) { this.placeDetails = { name: place.name, address: place.address || place.location, website: place.website, rating: place.rating, photos: place.image ? [place.image] : [], fallback: true } },
    async handleRecommendationClick(recommendation) {
      if (this.isOnCooldown) {
        // console.log('🚫 Action blocked - user on cooldown');
        this.showCooldownMessage(this.usageStatus);
        return;
      }
      // Track "Ask AI" interaction on the card (non-blocking)
      this.trackInteraction(recommendation, 'ai_ask');
      const type = (recommendation.type || '').toLowerCase();
      const category = (recommendation.category || '').toLowerCase();
      let aiPrompt = '';
      if (type === 'restaurant' || category === 'restaurant') { aiPrompt = this.t('chat.ai_prompts.restaurant', { name: recommendation.name }) } 
      else if (type === 'hotel' || category === 'hotel' || category === 'accommodation') { aiPrompt = this.t('chat.ai_prompts.hotel', { name: recommendation.name }) } 
      else if (category === 'event' || type === 'event') { aiPrompt = this.t('chat.ai_prompts.event', { name: recommendation.name }) } 
      else if (category === 'historical' || category === 'historical site' || type === 'historical') { aiPrompt = this.t('chat.ai_prompts.historical', { name: recommendation.name }) } 
      else if (category === 'hidden gem' || category === 'attraction' || type === 'hidden gem') { aiPrompt = this.t('chat.ai_prompts.hidden_gem', { name: recommendation.name }) } 
      else { aiPrompt = this.t('chat.ai_prompts.generic', { name: recommendation.name }) }
      this.userInput = aiPrompt;
      this._isAskAIRequest = true;
      await this.sendMessage();
    },
    handlePaste(event) {
      event.preventDefault();
      const pasted = event.clipboardData.getData('text');
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const before = this.userInput.slice(0, start);
      const after = this.userInput.slice(end);
      const available = MAX_INPUT_LENGTH - before.length - after.length;
      this.userInput = before + pasted.slice(0, available) + after;
      this.$nextTick(() => {
        const ta = this.$refs.chatInput;
        if (ta) {
          const pos = before.length + Math.min(pasted.length, available);
          ta.setSelectionRange(pos, pos);
          ta.focus();
        }
        this.adjustTextareaHeight();
      });
    },
    async sendMessage() {
      // A free-typed message supersedes the shopping clarifier prompt.
      this.showShoppingClarifier = false;
      const usageStatus = await this.checkUsageStatus();
      if (usageStatus?.cooldown?.active) {
        this.showCooldownMessage(usageStatus);
        return;
      }
      if (this.userInput.length > MAX_INPUT_LENGTH) {
        // console.log('🚫 Send blocked - input exceeds max length');
        return;
      }
      // console.log('📊 Pre-check state:', {isRequestPending: this.isRequestPending,userInput: this.userInput?.trim(),isStreaming: this.isStreaming});
      if (this.isStreaming) {
        // console.log('🛑 Stop streaming triggered from button');
        this.stopStreaming();
        return;
      }
      if (this.isRequestPending || !this.userInput.trim()) {
        // console.log('🚫 Send blocked - request pending or empty input');
        return;
      }
      this.isRequestPending = true;
      this.isStreaming = true;
      await this.checkSessionHealth();
      if (this.sessionHealth.shouldBlock) {
        this.showSessionLimitModal = true;
        return;
      }
      if (this.messages.length === 0 && this._greetText) {
        // hidden: the engine sees it in history (context for replies TO the
        // greeting), the traveler never sees it as a bubble (founder
        // 2026-09-01: "ai can see but user not").
        this.messages.push({ id: `greet-${Date.now()}`, sender: 'ai', text: this._greetText, timestamp: new Date(), hidden: true });
      }
      const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: this.userInput, timestamp: new Date() };
      this.messages.push(userMessage);
      const input = this.userInput;
      this.userInput = '';
      await this.$nextTick(() => {
        this.resetTextareaHeight();
        this.scrollToBottom(true);
      });
      await this.saveCurrentSession();
      const aiMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: '', streaming: true, timestamp: new Date(), isChatRecommendation: this._isAskAIRequest || false };
      if (this._isAskAIRequest) { this._isAskAIRequest = false }
      this.messages.push(aiMessage);
      this.isTyping = true;
      this.$forceUpdate();
      await this.$nextTick(() => { this.scrollToBottomForAnimation() });
      try {
        await this.streamAIResponse(input, aiMessage);
        const userMessages = this.messages.filter(m => m.sender === 'user');
        if (userMessages.length === 1) { await this.generateChatTitle() }
      } catch (error) {
        console.error('Streaming error:', error);
        if (error.name !== 'AbortError') {
          const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (messageIndex !== -1) {
            this.messages[messageIndex].text = this.t('chat.messages.connection_error');
            this.messages[messageIndex].streaming = false;
            this.$forceUpdate();
            this.scrollToBottom(true);
          }
        }
      } finally {
        this.isTyping = false;
        this.isStreaming = false;
        this.abortController = null;
        await this.saveCurrentSession();
        this.isRequestPending = false;
        await this.updateUsageStatus();
      }
    },
    getMaxPosition(message) {
      const recCount = message.recommendations?.length || 0;
      const textCount = message.textSections?.length || 0;
      return Math.max(recCount, textCount);
    },
    getTextAtPosition(message, position) {
      const section = message.textSections?.find(s => s.position === position);
      if (!section) return null;
      const trimmed = section.content.trim();
      if (!trimmed || trimmed.match(/^[\s\n\r<br>]+$/)) {return null}
      return section.content;
    },
    getRecommendationAtPosition(message, position) { return message.recommendations?.[position] || null },
    getPositionRange(message) {
      const maxPos = this.getMaxPosition(message);
      return Array.from({ length: maxPos }, (_, i) => i);
    },
    async streamAIResponse(userInput, aiMessage) {
      let accumulatedText = '';
      let textSections = [];
      let currentTextSection = '';
      let hasProcessedCompletion = false;
      try {
        // console.log('streamAIResponse');
        // console.log('📊 Initial state:', {isStreaming: this.isStreaming, isRequestPending: this.isRequestPending, isTyping: this.isTyping});
        /* Same local-controller rule as the quick-action handlers: awaits for
         * geolocation and IP fallback sit between here and the fetch, and
         * stopStreaming() nulls the shared field mid-flight. */
        const reqController = new AbortController();
        this.abortController = reqController;
        // console.log('🎮 Abort controller created');
        if (this.isRequestingImages) {
          await this.processImageStream(response);
          return;
        }
        let location = null;
        const locationCacheValid = this.userLocation?.timestamp && (Date.now() - this.userLocation.timestamp < 300000);
        if (locationCacheValid) { location = this.userLocation } 
        else {
          if (this.locationPermission !== 'denied') { location = await this.getCurrentLocation() }
          if (!location) {
            location = await this.getLocationFromIP();
            if (location) { this.userLocation = location }
          }
        }
        const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const autoDetect = this.userSettings?.privacy?.autoDetectLocation;
        const hasGPSLocation = location?.source === 'gps';
        const destCity = this.userSettings?.location?.city || '';
        const destCountry = this.userSettings?.location?.countryName || '';
        let locationMode;
        if (hasGPSLocation) {locationMode = 'gps'} 
        else if (!autoDetect && destCity) {locationMode = 'privacy_destination'} 
        else if (destCity) {locationMode = 'destination'} 
        else {locationMode = 'unknown'}
        const requestBody = { message: userInput, userTimezone: deviceTimezone, destinationInfo: { city: destCity, country: destCountry, mode: locationMode }, actionType: 'general_query', sessionId: this.activeSessionId, nearbyMode: this.nearbyMode, settings: { language: this.userSettings.language, currency: this.userSettings.currency, distanceUnit: this.userSettings.distanceUnit }, context: { userPreferences: this.userPreferences }};
        if (location) { requestBody.location = { lat: parseFloat(location.lat), lng: parseFloat(location.lng), radius: this.getSearchRadius(), source: location.source || 'unknown' } }
        // Engine pick (admin toggle in settings): v2 = the parallel new engine.
        // Same SSE dialect by contract, so everything below renders unchanged.
        const chatEndpoint = this.chatEngine === 'v2' ? 'chat-stream-v2' : 'chat-stream';
        const response = await fetch(`${API_BASE_URL}/api/ai/${chatEndpoint}`, {method: 'POST',headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },body: JSON.stringify(requestBody),signal: reqController.signal });
        this.applyUsageHeaders(response.headers);    
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.error === 'session_limit_reached') {
            console.log('🚫 Session limit reached');
            const userMsgIndex = [...this.messages].reverse().findIndex(m => m.text === userInput && m.sender === 'user');
            if (userMsgIndex !== -1) {
              const actualIndex = this.messages.length - 1 - userMsgIndex;
              this.messages.splice(actualIndex, 1);
            }
            const aiMsgIndex = this.messages.findIndex(m => m.id === aiMessage.id);
            if (aiMsgIndex !== -1) { this.messages.splice(aiMsgIndex, 1) }
            this.showSessionLimitModal = true;
            this.$forceUpdate();
            this.isTyping = false;
            this.isStreaming = false;
            this.isRequestPending = false;
            this.abortController = null;
            return;
          }
          console.log('Location error in chat:', errorData);      
          const userMsgIndex = [...this.messages].reverse().findIndex(m => m.text === userInput && m.sender === 'user');
          if (userMsgIndex !== -1) {
            const actualIndex = this.messages.length - 1 - userMsgIndex;
            this.messages.splice(actualIndex, 1);
          }      
          const aiMsgIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (aiMsgIndex !== -1) { this.messages.splice(aiMsgIndex, 1) }
          const locationErrorMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: errorData.message || 'Please set your travel destination in Settings or enable GPS location detection.',
            timestamp: new Date(),
            isLocationError: true,
            quickActions: ['Open Settings']
          };
          this.messages.push(locationErrorMessage);
          this.$forceUpdate();
          this.scrollToBottom(true);
          this.isTyping = false;
          this.isStreaming = false;
          this.isRequestPending = false;
          this.abortController = null;
          return;
        }
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          console.log('🚫 Daily limit / cooldown hit — keeping the user message, replying with a cooldown notice (option B: never yank what was shown)');
          // Option (b): do NOT roll back the user's message. Keep it, and turn the
          // empty AI placeholder (the genie-lamp) into a cooldown REPLY, so nothing
          // flashes in and then vanishes. The message now has a reply (the notice),
          // so it is not the orphan the old rollback was guarding against.
          const aiMsg429 = this.messages.find(m => m.id === aiMessage.id);
          if (aiMsg429) {
            aiMsg429.streaming = false;
            aiMsg429.text = errorData.message || this.cooldownMessage || 'You have reached your daily limit. Please try again later.';
            aiMsg429.isLimitReached = true;
          }
          this.showCooldownMessage({ cooldown: { active: true, until: errorData.cooldownUntil || null, hoursRemaining: errorData.cooldownUntil ? Math.ceil((new Date(errorData.cooldownUntil) - new Date()) / (1000 * 60 * 60)) : 4, reason: errorData.reason } });
          this.$forceUpdate();
          this.isTyping = false;
          this.isStreaming = false;
          this.isRequestPending = false;
          this.abortController = null;
          return;
        }
        if (!response.ok) { throw new Error(`Stream failed with status: ${response.status}`) }
        // console.log('✅ Backend connection established, starting stream processing');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let eventCount = { token: 0, streaming_recommendation: 0, recommendation_enriched: 0, recommendations: 0, complete: 0 };
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // console.log('🔚 Stream reader done - no more data');
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            if (chunk.trim() === '') continue;
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
                  if (messageIndex === -1) continue;
                  if (data.type && eventCount.hasOwnProperty(data.type)) { eventCount[data.type]++ }
                  if (data.type === 'token' && data.content) {
                    currentTextSection += data.content;
                    this.messages[messageIndex].currentText = currentTextSection;
                    this.engineStage = '';
                    this.$forceUpdate();
                  }
                  // Progress note from the engine ("Reading the city's event
                  // listings…"). Shown beside the lamp until prose arrives.
                  else if (data.type === 'stage') {
                    this.engineStage = data.text || '';
                    this.$forceUpdate();
                  }
                  else if (data.type === 'streaming_recommendation') {
                    const trimmedText = currentTextSection.trim();
                    const hasRealContent = trimmedText && trimmedText !== '' && !trimmedText.match(/^[\s\n\r<br>]+$/);
                    if (hasRealContent) {
                      textSections.push({type: 'text', content: currentTextSection, position: this.messages[messageIndex].recommendations?.length || 0});
                      console.log('✅ Saved text section:', trimmedText.substring(0, 50) + '...');
                    } else { console.log('⏭️ Skipped empty section:', JSON.stringify(currentTextSection)) }
                    currentTextSection = '';
                    if (!this.messages[messageIndex].recommendations) { this.messages[messageIndex].recommendations = [] }
                    const existingIndex = this.messages[messageIndex].recommendations.findIndex(rec => rec.id === data.recommendation.id || rec.name === data.recommendation.name);
                    if (existingIndex === -1) { this.messages[messageIndex].recommendations.push(data.recommendation) }
                    else {
                      // A live placeholder already streamed this card's description —
                      // merge the official record in, keep the id the description
                      // tokens are addressed to and the text already on screen.
                      const existing = this.messages[messageIndex].recommendations[existingIndex];
                      this.messages[messageIndex].recommendations[existingIndex] = { ...data.recommendation, id: existing.id, description: existing.description || data.recommendation.description };
                    }
                    this.messages[messageIndex].textSections = [...textSections];
                    this.messages[messageIndex].currentText = ''; 
                    this.messages[messageIndex].isChatRecommendation = true;
                    this.$forceUpdate();
                  }
                  else if (data.type === 'description_token') {
                    if (!this.messages[messageIndex].recommendations) { this.messages[messageIndex].recommendations = [] }
                    let rec = this.messages[messageIndex].recommendations.find( r => r.id === data.recommendationId || r.name === data.recommendationName );
                    /* The card is born HERE, at arrow-open — not after the block closes.
                     * The server names the card on every description_token, but the
                     * official streaming_recommendation can only fire after the closing ←
                     * (its regex needs the finished block) — so every live description
                     * token used to arrive before any card existed and was dropped on the
                     * floor. The description then got REPLAYED into the late card at
                     * 20ms/word: fake typing. Creating the placeholder from the first
                     * orphan token makes the middle of the answer stream for real, on
                     * both providers — Claude's burst just fills it faster. */
                    if (!rec && data.recommendationName) {
                      const trimmedText = currentTextSection.trim();
                      if (trimmedText && !trimmedText.match(/^[\s\n\r<br>]+$/)) {
                        textSections.push({ type: 'text', content: currentTextSection, position: this.messages[messageIndex].recommendations.length });
                      }
                      currentTextSection = '';
                      rec = {
                        id: `live-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: data.recommendationName,
                        description: '', category: 'Searching...', region: 'Searching location...',
                        location: 'Searching...', image: null, source: 'ai', placeId: null,
                        isChatRecommendation: true, isLargeCard: true, appearsInline: true, isStreaming: true,
                        metadata: { hasAIDescription: true, sourceDescription: 'ai_generated', streaming: true, enrichmentDeferred: true }
                      };
                      this.messages[messageIndex].recommendations.push(rec);
                      this.messages[messageIndex].textSections = [...textSections];
                      this.messages[messageIndex].currentText = '';
                      this.messages[messageIndex].isChatRecommendation = true;
                    }
                    if (rec) {
                      rec.description = (rec.description || '') + data.content;
                      rec.isStreaming = true;
                      this.$forceUpdate();
                      const currentText = this.messages[messageIndex].text;
                      if (currentText.includes(`**${rec.name}** →`)) {
                        if (!this.arrowBlockBuffers) this.arrowBlockBuffers = {};
                        if (!this.arrowBlockBuffers[rec.name]) { this.arrowBlockBuffers[rec.name] = data.content } 
                        else { this.arrowBlockBuffers[rec.name] += data.content }
                        const startText = currentText.split(`**${rec.name}** →`)[0];
                        const endText = currentText.split(`**${rec.name}** →`)[1] || '';
                        const cleanEndText = endText.split('←')[1] || '';
                        this.messages[messageIndex].text = startText + `**${rec.name}** →` + this.arrowBlockBuffers[rec.name] + '←' + cleanEndText;
                      }
                    }
                  }
                  else if (data.type === 'description_complete') { if (this.arrowBlockBuffers && data.recommendationName) { delete this.arrowBlockBuffers[data.recommendationName] } }
                  else if (data.type === 'recommendation_enriched') {
                    if (!this.messages[messageIndex].recommendations) { this.messages[messageIndex].recommendations = [] }
                    const index = this.messages[messageIndex].recommendations.findIndex(rec => rec.id === data.recommendation.id || rec.id === data.metadata?.originalId);
                    if (index !== -1) { this.messages[messageIndex].recommendations[index] = data.recommendation } 
                    else { this.messages[messageIndex].recommendations.push(data.recommendation) }
                    this.$forceUpdate();
                  }
                  else if (data.type === 'recommendations') {
                    if (!this.messages[messageIndex].recommendations) { this.messages[messageIndex].recommendations = [] }
                    data.recommendations.forEach(newRec => {
                      const existingIndex = this.messages[messageIndex].recommendations.findIndex(rec => rec.name === newRec.name);
                      if (existingIndex === -1) { this.messages[messageIndex].recommendations.push(newRec) } 
                      else { this.messages[messageIndex].recommendations[existingIndex] = { ...this.messages[messageIndex].recommendations[existingIndex], ...newRec } }
                    });
                    this.messages[messageIndex].isChatRecommendation = true;
                    this.$forceUpdate();
                  }
                  else if (data.type === 'complete') {
                    if (data.metadata?.sessionHealth) {
                      this.sessionHealth = {...data.metadata.sessionHealth, warningDismissed: false};
                      // console.log('📊 Session health updated:', this.sessionHealth);
                    }
                    if (currentTextSection.trim()) { textSections.push({ type: 'text', content: currentTextSection, position: this.messages[messageIndex].recommendations?.length || 0 }) }
                    hasProcessedCompletion = true;
                    this.engineStage = '';
                    this.messages[messageIndex].engineDebug = data.metadata?.debug || null;
                    // Persist the chat→map bridge target — the "See route"
                    // CTA renders from message.metadata.routeTo (live
                    // 2026-08-31: the handler copied only selected fields,
                    // so the button never appeared).
                    if (data.metadata?.routeTo) {
                      this.messages[messageIndex].metadata = { ...(this.messages[messageIndex].metadata || {}), routeTo: data.metadata.routeTo };
                    }
                    // A preference Jinni changed on request is already saved
                    // server-side, but nothing told the app — so localUser kept
                    // the old values and the Preferences screen still showed
                    // them. From the outside that is indistinguishable from not
                    // having saved at all (Arsen 2026-08-24: "it is not editing
                    // in user settings, it is editing in his mind only").
                    if (data.metadata?.prefApplied) {
                      this.syncUserAfterPrefChange();
                    }
                    // The Discovery/Nearby toggle is a CONTROL, not a label, and
                    // it sits in the chat input container where the traveler is
                    // already looking. When Jinni switches the mode they should
                    // watch the button move — that IS the confirmation. Leaving
                    // it on the old setting would put the contradiction on
                    // screen, inches from the reply announcing the change.
                    const modeChange = (data.metadata?.settingsApplied || [])
                      .find(s => s.field === 'searchMode');
                    if (modeChange) {
                      this.nearbyMode = modeChange.value === 'nearby';
                      try { localStorage.setItem('nearbyMode', this.nearbyMode.toString()); } catch (_) {}
                    } else if (data.metadata?.modeSwitched) {
                      // Jinni switched the mode ITSELF this turn (v2): the toggle
                      // said nearby, but they asked about a town they are not in,
                      // so the answer came from discovery. Arsen 2026-09-01: "when
                      // it worked on discovery it could send signal to front to
                      // toggle to discovery … because when it is working context
                      // is not nearby it is discovery."
                      //
                      // This is not cosmetic. The toggle IS what the next request
                      // sends, so leaving it on nearby made the FOLLOW-UP snap
                      // back: "what else?" carries no place name, and nearby mode
                      // resolves to GPS — a Dilijan deck would have been followed
                      // by Yerevan results with nothing on screen explaining why.
                      //
                      // Only the local control moves. Unlike settingsApplied above
                      // — an explicit command, which the server also persists —
                      // this switch was INFERRED, so the traveler's saved
                      // preference is untouched and one tap puts it back.
                      this.nearbyMode = data.metadata.modeSwitched === 'nearby';
                      try { localStorage.setItem('nearbyMode', this.nearbyMode.toString()); } catch (_) {}
                    }
                    if (messageIndex === -1) return;
                    // console.log('🎯 COMPLETION RECEIVED FOR ASK AI:');
                    // console.log('   isChatRecommendation:', this.messages[messageIndex].isChatRecommendation);
                    // console.log('   contentParts from backend:', data.contentParts);
                    // console.log('   contentParts length:', data.contentParts?.length || 0);
                    // console.log('   recommendations count:', data.recommendations?.length || 0);
                    // console.log('   textSections accumulated:', textSections.length);
                    // console.log('   currentTextSection:', currentTextSection?.substring(0, 50));
                    this.messages[messageIndex].streaming = false;
                    this.messages[messageIndex].nearbyMode = data.nearbyMode;
                    this.messages[messageIndex].contentParts = data.contentParts;
                    this.messages[messageIndex].recommendations = data.recommendations;
                    // Cards ⇒ chat-rec message (drives the large-card style). v1 sets
                    // this via streaming_recommendation events; v2 emits cards only at
                    // complete, so derive it here — a no-op when already true.
                    if (data.recommendations?.length) { this.messages[messageIndex].isChatRecommendation = true; }
                    this.messages[messageIndex].textSections = null;
                    this.messages[messageIndex].currentText = null;
                    // Light up like/dislike for any of these places the user voted on
                    // in a previous chat (per-place, cross-session). Run AFTER the DOM
                    // has rendered the cards and against the LIVE message array (not the
                    // raw stream payload), so the reactive recFeedback update actually
                    // reaches mounted card components. Doing it inline here (before the
                    // cards mount) is why the highlight previously needed a refresh.
                    this.$nextTick(() => {
                      const mi = this.messages.findIndex(m => m.id === aiMessage.id);
                      if (mi !== -1) this.hydrateVotesForRecs(this.messages[mi].recommendations);
                    });
                    // console.log('   AFTER SETTING:');
                    // console.log('   message.contentParts:', this.messages[messageIndex].contentParts?.length || 0);
                    // console.log('   message.recommendations:', this.messages[messageIndex].recommendations?.length || 0);
                  }
                  else if (data.type === 'itinerary_clarifier') {
                    // Chat detected "plan me a trip" — open the SAME sequential
                    // clarifier the quick-action button uses, prefilled with
                    // whatever the message already answered. The build itself
                    // still goes through launchItinerary → <ItineraryView>,
                    // so both entry points share one path.
                    this.showMobileActions = false;
                    this.showShoppingClarifier = false;
                    this.itineraryDraft = {
                      daysCount: data.prefill?.daysCount || 3,
                      hotelName: '', pickHotel: false, hotelBreakfast: false, tripBudgetTotal: null, people: 2,
                    };
                    this.abortHotelPrefetch();
                    // Destination named in chat ("… in Paris") — carried into
                    // launchItinerary. Not reactive state on purpose: transient,
                    // never rendered, never serialized.
                    this._itinPrefillDestination = data.prefill?.destination || null;
                    // Days already stated → skip straight to the hotel step.
                    // A chat-named destination overrides nearby mode (the user
                    // asked about a specific city, not "around me"), so the
                    // nearby confirm step is skipped in that case too.
                    this.itineraryStep = data.prefill?.daysCount
                      ? 'hotel'
                      : ((this.nearbyMode && !this._itinPrefillDestination) ? 'confirmNearby' : 'days');
                    this.$nextTick(() => this.scrollToBottom(true));
                  }
                  else if (data.type === 'itinerary_day_regen') {
                    // Chat asked to update a day of an existing trip — drive the
                    // SAME regenerate-day flow the itinerary's button uses, on
                    // the mounted <ItineraryView> that renders that trip.
                    const target = this.messages.find(m => m.itineraryId === data.itineraryId);
                    const view = target && this._itinViews && this._itinViews[target.id];
                    if (view && view.itinerary && (view.days || []).some(d => d.dayNumber === data.dayNumber)) {
                      view.activeDay = data.dayNumber;
                      this.$nextTick(() => { try { view.regenerateDay(); } catch (e) { console.error('chat-driven day regen failed:', e); } });
                    } else {
                      console.warn('itinerary_day_regen: no mounted view for', data.itineraryId, 'day', data.dayNumber);
                    }
                  }
                  else if (data.type === 'entity_details') {
                    this.messages[messageIndex].streaming = false;
                    this.messages[messageIndex].entityDetails = data.data || data;
                    if (data.imageGallery && data.imageGallery.images && data.imageGallery.images.length > 0) { this.messages[messageIndex].imageGallery = data.imageGallery }
                    this.$forceUpdate();
                  }
                  else if (data.type === 'entity_not_found') {
                    this.messages[messageIndex].streaming = false;
                    this.messages[messageIndex].alternatives = data.alternatives;
                    if (data.imageGallery && data.imageGallery.images && data.imageGallery.images.length > 0) { this.messages[messageIndex].imageGallery = data.imageGallery }
                    this.$forceUpdate();
                  }
                  else if (data.type === 'image_stream_start') {
                    this.fullscreenImages = [];
                    this.showFullscreenModal = true;
                    this.fullscreenLoading = true;
                    document.body.style.overflow = 'hidden';
                  }
                  else if (data.type === 'image_single') {
                    const resolvedUrl = this.getImageUrl(data.image.url);
                    this.fullscreenImages.push({ url: resolvedUrl, title: data.image.title || 'Image', caption: data.image.caption || '', source: data.image.source || 'google_places' });
                    // Warm the browser cache so flipping is instant.
                    if (resolvedUrl && !resolvedUrl.startsWith('data:')) { const pre = new Image(); pre.src = resolvedUrl; }
                    if (data.progress.current === 1) {
                      this.currentFullscreenIndex = 0;
                      this.fullscreenLoading = false;
                    }
                    this.$forceUpdate();
                  }
                  else if (data.type === 'image_stream_complete') {
                    this.fullscreenLoading = false;
                    const cacheKey = this.generateImageCacheKey({ name: data.placeName });
                    this.setCachedImages(cacheKey, this.fullscreenImages);
                    this.$forceUpdate();
                  }
                  else if (data.type === 'image_error') {
                    console.error('❌ Image stream error:', data.message);
                    this.fullscreenLoading = false;
                    if (this.showFullscreenModal) { this.closeFullscreenModal() }
                  }
                  else if (data.type === 'error') {
                    console.error('Stream error:', data.message);
                    // Never surface a raw internal/provider error (e.g. "Daily token limit
                    // reached.", rate-limit strings) to the user — show a friendly line.
                    // If the server flags it as a capacity/limit issue (reason/code), cool
                    // the input down at the same moment so the user isn't retrying into a
                    // capped provider. (The real fix is the Claude→DeepSeek failover, which
                    // avoids this error path entirely.)
                    const capacity = data.reason === 'capacity' || data.reason === 'daily_limit' || data.code === 429 || data.code === 529;
                    this.messages[messageIndex].text = capacity
                      ? (this.cooldownMessage || 'Jinni is at capacity right now — please try again a little later.')
                      : (this.t('chat.messages.connection_error') || 'Jinni had a brief hiccup — please try again in a moment.');
                    this.messages[messageIndex].streaming = false;
                    if (capacity) {
                      this.messages[messageIndex].isLimitReached = true;
                      this.showCooldownMessage({ cooldown: { active: true, hoursRemaining: 4, reason: 'capacity' } });
                    }
                    this.$forceUpdate();
                  }
                } catch (e) { console.warn('Failed to parse streaming data:', line, e) }
              }
            }
          }
          this.scrollToBottom();
        }
        // Safety-net cross-chat highlight: whatever path populated this message's
        // recommendations (batch 'complete' or incremental streaming), hydrate any
        // prior votes once the stream has fully finished. Idempotent — never
        // overwrites a vote already in recFeedback.
        {
          const finalMsg = this.messages.find(m => m.id === aiMessage.id);
          if (finalMsg?.recommendations?.length) {
            await this.$nextTick();
            await this.hydrateVotesForRecs(finalMsg.recommendations);
          }
        }
        if (!hasProcessedCompletion && this.messages.find(m => m.id === aiMessage.id)?.streaming === false) {
          // console.log('🔄 Stream ended without completion event, applying fallback');
          const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (messageIndex !== -1) {
            const finalCleanedText = accumulatedText.replace(/\*\*([^*]+)\*\*\s*→\s*([^←]+)←/g, '');
            this.messages[messageIndex].text = finalCleanedText;
            this.messages[messageIndex].streaming = false;
            this.$forceUpdate();
            console.log('🛠️ Fallback applied:', {textLength: finalCleanedText.length,recommendations: this.messages[messageIndex].recommendations?.length || 0});
          }
        } else if (hasProcessedCompletion) { 
          // console.log('✅ Completion event was already processed, skipping fallback') 
        }
      } catch (error) {
        this.isTyping = false;
        this.isRequestingImages = false;
        this.isStreaming = false;
        if (error.name === 'AbortError') {
          console.log('Stream aborted by user');
          const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (messageIndex !== -1) {
            if (this.messages[messageIndex].recommendations) {
              this.messages[messageIndex].recommendations = this.messages[messageIndex].recommendations.map(rec => ({
                ...rec,
                category: rec.category === 'Searching...' ? 'Venue' : (rec.category || 'Venue'),
                region: rec.region === 'Searching location...' ? '' : (rec.region || ''),
                location: rec.location === 'Searching...' ? '' : (rec.location || ''),
                address: rec.address === 'Searching...' ? '' : (rec.address || rec.location || ''),
                description: rec.description || rec.name,
                metadata: {...rec.metadata, interrupted: true, wasStreaming: true}
              }));
            }
            if (this.messages[messageIndex].isChatRecommendation) {
              const contentParts = [];  
              const maxPosition = Math.max(...(textSections || []).map(s => s.position || 0), (this.messages[messageIndex].recommendations?.length || 1) - 1);
              for (let pos = 0; pos <= maxPosition; pos++) {
                const textSection = textSections?.find(s => s.position === pos);
                if (textSection && textSection.content.trim()) { contentParts.push({ type: 'text', content: textSection.content }) }    
                if (pos < (this.messages[messageIndex].recommendations?.length || 0)) { contentParts.push({ type: 'recommendation', index: pos }) }
              }  
              if (currentTextSection?.trim()) { contentParts.push({ type: 'text', content: currentTextSection }) }
              this.messages[messageIndex].contentParts = contentParts;
              this.messages[messageIndex].textSections = null;
              this.messages[messageIndex].currentText = null;
            } else {
              let fullText = '';
              if (textSections && textSections.length > 0) { fullText = textSections.map(section => section.content).join('') }
              if (currentTextSection?.trim()) { fullText += currentTextSection }
              const finalCleanedText = fullText.replace(/\*\*([^*]+)\*\*\s*→\s*([^←]+)←/g, '');
              this.messages[messageIndex].text = finalCleanedText;
            }
            this.messages[messageIndex].streaming = false;
            this.$forceUpdate();
          }
          return;
        }
        console.error('Stream error:', error);
        const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
        if (messageIndex !== -1) {
          this.messages[messageIndex].text = this.t('chat.messages.connection_error');
          this.messages[messageIndex].streaming = false;
          this.$forceUpdate();
        }
      }
    },
    async checkSessionHealth() {
      if (!this.activeSessionId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/chat-sessions/${this.activeSessionId}/health`,{ headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        if (response.data.success) { this.sessionHealth = {messageCount: response.data.health.messageCount,remainingMessages: response.data.health.remainingMessages,shouldWarn: response.data.health.shouldWarn,warningDismissed: false} }
      } catch (error) { console.error('Failed to check session health:', error) }
    },
    dismissSessionWarning() { this.sessionHealth.warningDismissed = true },
    async startNewChatFromWarning() {
      this.sessionHealth.warningDismissed = true;
      this.showSessionLimitModal = false;
      await this.startNewChat();
    },
    async processImageStreamWithCache(response, recommendation, cacheKey) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let progressiveImages = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'image_stream_start') {
                  progressiveImages = [];
                  this.fullscreenLoading = true;
                }
                else if (data.type === 'image_single') {
                  progressiveImages.push(data.image);
                  if (data.progress.current === 1) { this.openFullscreenModal([data.image]) }
                  else {
                    const resolvedUrl = this.getImageUrl(data.image.url || data.image.src);
                    this.fullscreenImages.push({ ...data.image, url: resolvedUrl });
                    // Warm the browser cache now so flipping to this slot is
                    // instant instead of a multi-second fetch at click time.
                    if (resolvedUrl && !resolvedUrl.startsWith('data:')) { const pre = new Image(); pre.src = resolvedUrl; }
                    this.$forceUpdate();
                  }
                }
                else if (data.type === 'image_single_error') { console.warn(`⚠️ Image ${data.index + 1} failed: ${data.error}`) }
                else if (data.type === 'image_stream_complete') { this.setCachedImages(cacheKey, progressiveImages) }
                else if (data.type === 'image_error') {
                  console.error('❌ Image stream error:', data.message);
                  return;
                }
              } catch (parseError) { console.warn('Failed to parse image stream data:', parseError) }
            }
          }
        }
      } catch (error) { console.error('Stream processing failed:', error) }
    },
    generateImageCacheKey(recommendation) {
      const placeName = recommendation.name.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
      return `jinni_images_${placeName}`;
    },
    getCachedImages(cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) {
          // console.log(`🔍 Cache MISS for: ${cacheKey}`);
          return null;
        }
        const { images, expiresAt } = JSON.parse(cached);
        const now = Date.now();
        if (now > expiresAt) {
          // console.log(`⏰ Cache EXPIRED for: ${cacheKey}`);
          localStorage.removeItem(cacheKey);
          return null;
        }
        // console.log(`✅ Cache HIT for: ${cacheKey} (${images.length} images)`);
        return images;
      } catch (error) {
        console.warn('❌ Cache read error:', error);
        return null;
      }
    },
    setCachedImages(cacheKey, images) {
      const cacheData = { images, timestamp: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
      try { localStorage.setItem(cacheKey, JSON.stringify(cacheData)) } 
      catch (error) {
        console.warn('❌ Cache write error:', error);
        try {
          this.cleanOldImageCache();
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } 
        catch (retryError) { console.warn('❌ Cache retry failed:', retryError) }
      }
    },
    // Serialize messages into the exact shape persisted to the server.
    // Shared by saveCurrentSession (what to PATCH) and seedSavedSignature
    // (what the just-loaded state looks like) so the dirty check compares
    // like with like.
    serializeMessagesForSave(messages) {
      return (messages || []).map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
        streaming: msg.itineraryId ? false : (msg.streaming || false),
        isChatRecommendation: msg.isChatRecommendation || false,
        actionType: msg.actionType,
        ...(msg.subType && { subType: msg.subType }),
        ...(msg.itineraryId && { itineraryId: msg.itineraryId }),
        ...(msg.shoppingOptions && { shoppingOptions: msg.shoppingOptions }),
        viewMoreCount: msg.viewMoreCount || 0,
        isViewMore: msg.isViewMore || false,
        isLoadingMore: false,
        ...(msg.quickActions && { quickActions: msg.quickActions }),
        // Route answers: without this the save allowlist drops routeTo and
        // the See-route button vanishes after a refresh (live 2026-08-31).
        ...(msg.metadata?.routeTo && { metadata: { routeTo: msg.metadata.routeTo } }),
        ...(msg.hidden && { hidden: true }),
        ...(msg.recommendations && {
          recommendations: msg.recommendations.map(rec => ({
            id: rec.id,
            name: rec.name,
            category: rec.category,
            type: rec.type,
            description: rec.description || '',
            image: rec.image,
            address: rec.address,
            location: rec.location,
            distance: rec.distance,
            rating: rec.rating,
            placeId: rec.placeId,
            // Coordinates for the recommendation map. Without these, the save
            // whitelist drops them and the map disappears after a refresh.
            latitude: rec.latitude ?? null,
            longitude: rec.longitude ?? null,
            verifiedId: rec.verifiedId || null,
            // Which collection verifiedId points to — destinations must not
            // show the partner badge after a reload.
            _verifiedModel: rec._verifiedModel || null,
            source: rec.source || null,
            isPartner: rec.isPartner || false,
            partnerTier: rec.partnerTier || null,
            website: rec.website,
            phone: rec.phone,
            photos: rec.photos || [],
            // Event-specific fields. Kept so the rec card's date/time row
            // survives a save → reload cycle. Spread conditionally so
            // non-event recs don't carry empty keys.
            ...(rec.eventSchedule && { eventSchedule: rec.eventSchedule }),
            // The "Check listing" source link on event cards. ChatSession's
            // schema stores it (recommendationSchema.sourceUrl) — it was this
            // whitelist that dropped it, killing the link on every reload.
            ...(rec.sourceUrl && { sourceUrl: rec.sourceUrl }),
            ...(rec._isExpired != null && { _isExpired: rec._isExpired }),
            ...(rec._action && { _action: rec._action }),
            feedback: rec.feedback || null
          }))
        }),
        feedback: msg.feedback || null,
        ...(msg.contentParts && { contentParts: msg.contentParts })
      }));
    },
    // Build the signature string used for the dirty check.
    computeSessionSignature(messages, title) {return JSON.stringify(this.serializeMessagesForSave(messages)) + '||' + (title || 'New Chat')},
    // Record the current persisted state for a session so a subsequent
    // no-op save is correctly skipped. Called right after a session is
    // loaded from the server (its in-memory state == its persisted state).
    seedSavedSignature(sessionId, messages, title) {this._savedSignatures[sessionId] = this.computeSessionSignature(messages, title)},
    async saveCurrentSession() {
      if (!this.activeSessionId) return;
      const sessionIndex = this.chatSessions.findIndex(s => s.id === this.activeSessionId);
      if (sessionIndex !== -1) {
        const messagesToSave = this.serializeMessagesForSave(this.messages);
        const newTitle = this.activeSession?.title || 'New Chat';
        // Dirty check — only persist when the messages or title actually
        // changed since the last save for THIS session. Without this, simply
        // opening/viewing a chat (loadChatSession saves the previous one)
        // would PATCH it and bump updatedAt to "now", reshuffling the
        // updatedAt-sorted sidebar and making refresh land on the wrong chat.
        const signature = JSON.stringify(messagesToSave) + '||' + newTitle;
        if (this._savedSignatures[this.activeSessionId] === signature) {
          return; // nothing changed — skip save, keep updatedAt untouched
        }
        this.chatSessions[sessionIndex].messages = messagesToSave;
        this.chatSessions[sessionIndex].title = newTitle;
        this.chatSessions[sessionIndex].updatedAt = new Date().toISOString();
        await axios.patch(`${API_BASE_URL}/api/ai/chat-sessions/${this.activeSessionId}`, { messages: messagesToSave, title: newTitle }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        // Record what we just persisted so subsequent no-op saves are skipped.
        this._savedSignatures[this.activeSessionId] = signature;
      }
    },
    resetTextareaHeight() {
      const textarea = this.$refs.chatInput;
      if (textarea) {
        textarea.style.height = '';
        textarea.style.minHeight = '';
        void textarea.offsetHeight;
        textarea.rows = 1;
      }
    },
    // Itinerary image button → same gallery as the card's image button.
    // Awaits requestImages so the child's spinner clears exactly when the
    // request settles (cache hit, stream complete, cooldown, or error).
    async onItineraryPhotos(rec, done) {
      try { await this.requestImages(rec); }
      finally { if (typeof done === 'function') done(); }
    },
    async requestImages(recommendation) {
      if (this.isOnCooldown) {
        // console.log('🚫 Image request blocked - user on cooldown');
        this.showCooldownMessage(this.usageStatus);
        return;
      }
      if (this.globalImageRequest) {
        // console.log('Global request already in progress, skipping');
        return;
      }
      const buttonId = this.getRecommendationId(recommendation);
      if (this.getButtonState(recommendation) === 'loading') {
        // console.log('Button already in loading state, skipping');
        return;
      }
      this.imageRequestStates.set(buttonId, 'loading');
      this.globalImageRequest = true;
      this.$forceUpdate();
      const cacheKey = this.generateImageCacheKey(recommendation);
      // console.log(`🖼️ Image request for: ${recommendation.name}`);
      const cachedImages = this.getCachedImages(cacheKey);
      if (cachedImages && cachedImages.length > 0) {
        // console.log(`⚡ Using cached images (${cachedImages.length})`);
        this.openFullscreenModal(cachedImages);
        this.imageRequestStates.set(buttonId, 'idle');
        this.globalImageRequest = false;
        this.$forceUpdate();
        return;
      }
      try {
        // Track "More Images" interaction on the card (non-blocking)
        this.trackInteraction(recommendation, 'more_images');
        // verifiedId may be missing on old saved sessions — extract from id field "db-<mongoId>-<index>"
        let resolvedVerifiedId = recommendation.verifiedId || null;
        if (!resolvedVerifiedId && recommendation.id && typeof recommendation.id === 'string' && recommendation.id.startsWith('db-')) {
          const candidate = recommendation.id.split('-').find(p => /^[a-f0-9]{24}$/i.test(p));
          if (candidate) {
            resolvedVerifiedId = candidate;
            console.log('🖼️ [IMAGE BTN] extracted verifiedId from id field:', resolvedVerifiedId);
          }
        }
        // An event resolved through its venue has no placeId of its own (the venue's
        // id is deliberately NOT adopted as the event's identity), but it does carry
        // venuePlaceId. Fall back to it so "more images" returns the venue's photos
        // instead of searching Google for an event name that has no listing.
        // An EVENT has no photos of its own. With a resolved venue we ask by
        // its placeId; without one we must ask by the VENUE'S NAME, never the
        // event's. Searching "Սև ու սպիտակ մածուն" returned photos of unrelated
        // places, because no venue on earth is called that (live 2026-08-24).
        const askPlaceId = recommendation.placeId || recommendation.venuePlaceId || null;
        const askName = (!askPlaceId && this.isEventRec(recommendation) && recommendation.venueName)
            ? recommendation.venueName
            : recommendation.name;
        const imagePayload = { imageRequest: { placeName: askName, placeId: askPlaceId, verifiedId: resolvedVerifiedId, location: this.userLocation } };
        console.log('🖼️ [IMAGE BTN] recommendation object:', JSON.stringify({ name: recommendation.name, placeId: recommendation.placeId, verifiedId: resolvedVerifiedId, source: recommendation.source }, null, 2));
        console.log('🖼️ [IMAGE BTN] sending payload:', JSON.stringify(imagePayload, null, 2));
        const response = await fetch(`${API_BASE_URL}/api/ai/image-request-only`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify(imagePayload)
        });
        if (response.status === 429) {
          const errorData = await response.json();
          console.error('🚫 Image request blocked - cooldown active');            
          this.showCooldownMessage({ cooldown: { active: true, hoursRemaining: errorData.cooldownUntil ? Math.ceil((new Date(errorData.cooldownUntil) - new Date()) / (1000 * 60 * 60)) : 4, reason: errorData.reason } });
          this.imageRequestStates.set(buttonId, 'idle');
          this.globalImageRequest = false;
          this.$forceUpdate();
          return;
        }
        if (!response.ok) { throw new Error(`Failed to fetch images: ${response.status}`); }
        await this.processImageStreamWithCache(response, recommendation, cacheKey);
        this.imageRequestStates.set(buttonId, 'idle');
      } catch (error) {
        console.error('❌ Error requesting images:', error);
        this.fullscreenLoading = false;
        if (this.showFullscreenModal) { this.fullscreenImages = [{ url: '/images/error-placeholder.png', title: 'Error loading images', caption: 'Could not load images. Please try again.' }] }
      } finally {
        this.imageRequestStates.set(buttonId, 'idle');
        this.globalImageRequest = false;
        this.$forceUpdate();
      }
    },
    getButtonState(recommendation) {
      const buttonId = this.getRecommendationId(recommendation);
      return this.imageRequestStates.get(buttonId) || 'idle';
    },
    isButtonDisabled(recommendation) {
      const state = this.getButtonState(recommendation);
      if (state === 'loading' || this.globalImageRequest) return true;
      // An event with neither a resolved venue nor a venue name has nothing
      // real to show. Firing anyway is how the button returned photos of
      // unrelated places; an honest dead button beats a confident wrong one.
      if (this.isEventRec(recommendation)
          && !recommendation.placeId && !recommendation.venuePlaceId && !recommendation.venueName) return true;
      return false;
    },
    handleQuickAction(action) {
      if (action === 'Open Settings') {
        this.showSettings();
        return;
      }
      if (action === 'Preferences') {
        this.editPreferences();
        return;
      }
      this.userInput = action;
      this.sendMessage();
    },
    // Clarifier chip handler: user picked a shopping sub-type → hide the prompt
    // and run the shopping quick action with that sub-type. Routes through the
    // normal card-stream path (View More, exclusions, persistence).
    selectShoppingType(subType) {
      this.showShoppingClarifier = false;
      this.triggerQuickAction('shopping', { subType });
    },
    // Dismiss the shopping clarifier without searching.
    cancelShoppingClarifier() {this.showShoppingClarifier = false},
    // ── Itinerary setup (sequential) ───────────────────────────────────────
    // Step 1 answered → advance to the hotel step.
    pickItineraryDays(n) {
      this.itineraryDraft.daysCount = n;
      // Budget-style travelers get a whole-trip budget step; everyone else
      // skips straight to the hotel step (budget matters only when they asked
      // to travel on a budget).
      this.itineraryStep = (this.userPreferences.travelStyle === 'budget') ? 'budget' : 'hotel';
      this.$nextTick(() => this.scrollToBottom(true));
    },
    // Currency the budget is entered in — the user's preference-budget currency,
    // else their display currency, else USD.
    tripBudgetCurrency() {
      return (this.userPreferences.budget && this.userPreferences.budget.currency)
        || this.userSettings.currency || 'USD';
    },
    // Budget step answered → continue to the hotel step (budget optional).
    submitItineraryBudget() {
      this.itineraryStep = 'hotel';
      this.$nextTick(() => this.scrollToBottom(true));
    },
    skipItineraryBudget() {
      this.itineraryDraft.tripBudgetTotal = null;
      this.itineraryStep = 'hotel';
      this.$nextTick(() => this.scrollToBottom(true));
    },
    cancelItinerary() {
      this.itineraryStep = null;
      this._itinPrefillDestination = null;
      this.abortHotelPrefetch();
    },
    // "Suggest hotels" toggle — the hotels request starts HERE, not on Build.
    // By the time the user answers the breakfast question and presses Build,
    // the list is usually already resolved, so the chooser appears instantly.
    // "Suggest hotels" launches the build directly: with the breakfast
    // question moved to AFTER the hotel pick, there is nothing left to decide
    // on this step — a separate Build press was pure friction. The prefetch
    // still starts first so the hotel list is usually ready by the time the
    // chooser renders.
    suggestHotelsAndLaunch() {
      this.itineraryDraft.pickHotel = true;
      this.itineraryDraft.hotelName = '';
      this.prefetchHotels();
      this.launchItinerary();
    },
    abortHotelPrefetch() {
      try { this._hotelPrefetchAbort?.abort(); } catch (_) {}
      this._hotelPrefetchAbort = null;
      this._hotelPrefetch = null;
    },
    // Same endpoint + SSE wire format as ItineraryView.fetchPoolAction.
    // Resolves an array of recs, or null on any failure — NEVER rejects, so
    // the consumer can `await` it bare and fall back to its own fetch.
    prefetchHotels() {
      this.abortHotelPrefetch();
      const ctrl = new AbortController();
      this._hotelPrefetchAbort = ctrl;
      this._hotelPrefetch = (async () => {
        const res = await fetch(`${API_BASE_URL}/api/ai/quick-action-stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({
            action: 'hotels', count: 5, actionType: 'quick_action',
            // Chat-named destination → hotels for THAT city (and never "around
            // me": a remote destination overrides nearby mode, matching
            // launchItinerary). Button flow (_itinPrefillDestination null) is
            // byte-identical to before.
            nearbyMode: this._itinPrefillDestination ? false : !!this.nearbyMode,
            ...(Number.isFinite(this._itinPrefillDestination?.lat) && Number.isFinite(this._itinPrefillDestination?.lng)
              ? { location: { lat: this._itinPrefillDestination.lat, lng: this._itinPrefillDestination.lng } }
              : {}),
          }),
          signal: ctrl.signal,
        });
        if (!res.ok) return null;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', recs = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if ((data.type === 'complete' || data.type === 'recommendations') && data.recommendations?.length) {
                  recs = data.recommendations;
                }
              } catch (_) {}
            }
          }
        }
        return recs.filter(r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
      })().catch(e => {
        if (e.name !== 'AbortError') console.warn('hotel prefetch failed:', e);
        return null;   // consumer falls back to its own fetch
      });
    },
    // Nearby-mode confirmation → proceed to day selection. "Use Discovery"
    // flips the global mode off first so the whole build (and its radius) runs
    // in Discovery; "Keep Nearby" proceeds as-is.
    confirmNearbyItinerary(keepNearby) {
      if (!keepNearby && this.nearbyMode) {
        this.nearbyMode = false;
        try { localStorage.setItem('nearbyMode', 'false'); } catch (_) {}
      }
      this.itineraryStep = 'days';
      this.$nextTick(() => this.scrollToBottom(true));
    },
    // Build: push an AI message carrying the params. <ItineraryView> opens the
    // stream itself. No `destination` is sent → the backend uses the same
    // effective location (the user's onboarding destination / detected GPS)
    // that every other AI endpoint uses. A typed hotel name is resolved to
    // coordinates server-side (PlaceCache), or omitted if left blank.
    launchItinerary() {
      const hotel = (this.itineraryDraft.hotelName || '').trim();
      const daysCount = this.itineraryDraft.daysCount;
      this.itineraryStep = null;
      const wantsSuggestions = !hotel && this.itineraryDraft.pickHotel;
      // Typed hotel name wins over the toggle → the prefetch (if any) is moot.
      if (!wantsSuggestions) this.abortHotelPrefetch();
      // Ownership of the in-flight prefetch transfers to <ItineraryView> via
      // the request object. Safe: itineraryRequest is transient (never
      // serialized — serializeMessagesForSave field-picks itineraryId only).
      const prefetchedHotels = wantsSuggestions ? (this._hotelPrefetch || null) : null;
      this._hotelPrefetch = null; this._hotelPrefetchAbort = null;
      // User bubble — same convention as other quick actions ("Nearby ·
      // Itinerary · 3 days · Hotel X"), so the conversation reads naturally.
      // Destination named in chat ("plan 3 days in Paris") — set by the
      // itinerary_clarifier stream event; null for the quick-action button.
      const chatDestination = this._itinPrefillDestination || null;
      this._itinPrefillDestination = null;
      const dayWord = daysCount === 1 ? this.t('chat.itinerary.day') : this.t('chat.itinerary.days');
      const modeText = this.nearbyMode ? this.t('chat.input.mode_nearby') : this.t('chat.input.mode_discovery');
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: `${chatDestination?.name || modeText} · ${this.t('chat.actions.itinerary')} · ${daysCount} ${dayWord}${hotel ? ' · ' + hotel : ''}`,
        timestamp: new Date(),
      };
      this.messages.push(userMessage);
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: '',
        timestamp: new Date(),
        itineraryRequest: {
          daysCount,
          // Explicit destination (chat-named). When present the build MUST take
          // the generate-stream path (usePool: false): the pool endpoints are
          // centered on the user's effective location and would fetch places
          // around the wrong city. generate-stream already accepts an explicit
          // { name, lat, lng } destination and plans around it.
          destination: chatDestination,
          homeBase: hotel ? { name: hotel } : null,
          // Nearby mode → the backend plans a compact itinerary within the
          // user's nearby radius instead of the wider discovery radius. A
          // chat-named destination is a remote city, never "around me".
          nearbyMode: chatDestination ? false : this.nearbyMode,
          // Pool composition (quick-action pools + algorithmic build) is the
          // default; ItineraryView falls back to the LLM skeleton on thin pools.
          usePool: !chatDestination,
          pickHotel: !hotel && this.itineraryDraft.pickHotel,
          prefetchedHotels,
          hotelBreakfast: this.itineraryDraft.hotelBreakfast,
          // Whole-trip budget (distinct from the preference budget). Only set
          // when a budget-style traveler entered one. Flows to BOTH build paths
          // (generate-stream via {...req}, build-from-pool explicitly).
          ...(this.itineraryDraft.tripBudgetTotal > 0 ? { tripBudget: {
            total: Number(this.itineraryDraft.tripBudgetTotal),
            currency: this.tripBudgetCurrency(),
            people: Math.max(1, parseInt(this.itineraryDraft.people, 10) || 1),
          } } : {}),
        },
        itineraryId: null,
      };
      this.messages.push(aiMessage);
      this.scrollToBottom();
    },
    // Non-reactive registry of mounted ItineraryView instances, so the global
    // Stop button can abort an in-flight generation (mirrors registerRecMap).
    registerItineraryView(id, el) {
      if (!this._itinViews) this._itinViews = {};
      if (el) this._itinViews[id] = el;
      else delete this._itinViews[id];
    },
    // Generation lifecycle from <ItineraryView> — drives the lamp (message
    // streaming flag) and the global stop button (isStreaming).
    onItineraryStreamState(message, active) {
      const idx = this.messages.findIndex(m => m.id === message.id);
      // itineraryStreaming (not streaming) so the big top lamp stays off — a
      // small lamp renders BELOW the itinerary instead. Never serialized
      // (serializeMessagesForSave field-picks), so it can't stick after reload.
      if (idx !== -1) {
        const msg = this.messages[idx];
        msg.itineraryStreaming = active;
        if (active) {
          // Re-run while an exit is still playing: cancel the exit so the
          // lamp continues seamlessly instead of unmounting mid-restart.
          msg.itineraryLampExiting = false;
        } else {
          // Keep the lamp mounted just long enough to play its full exit
          // (0.5s fade + collapse ending ~2.7s), then release the DOM.
          // Transient like itineraryStreaming — never serialized.
          msg.itineraryLampExiting = true;
          setTimeout(() => {
            const i = this.messages.findIndex(m => m.id === message.id);
            if (i !== -1 && !this.messages[i].itineraryStreaming) {
              this.messages[i].itineraryLampExiting = false;
            }
          }, 2800);
        }
      }
      this.isStreaming = active;
      if (!active) this.isRequestPending = false;
    },
    // Hotel chooser open/closed inside <ItineraryView> — the lamp is hidden
    // while it's open so its dust doesn't cover the first hotel cards, and
    // reappears once the user picks or skips. Transient, like
    // itineraryStreaming: never serialized, so it can't stick after reload.
    onItineraryHotelChoice(message, open) {
      const idx = this.messages.findIndex(m => m.id === message.id);
      if (idx !== -1) this.messages[idx].itineraryHotelChoosing = open;
    },
    // Fired once the backend created the doc — store its id so a session reload
    // restores it from Mongo (never regenerates).
    async onItineraryCreated(message, id, meta) {
      message.itineraryId = id;
      // Set the chat title directly from the trip meta — deterministic and
      // correct ("Paphos · 3 days"). The AI title generator is skipped: fed an
      // empty itinerary message it echoed its own instruction ("Concise title
      // crafting").
      const session = this.chatSessions.find(s => s.id === this.activeSessionId);
      // "Still untitled" must be language-agnostic: new sessions are saved with
      // the LOCALIZED placeholder (t('chat.header.new_chat_title') → "Новый чат"
      // in Russian, etc.), so comparing only against the English "New Chat"
      // meant non-English itinerary chats were never renamed. Match the current
      // locale's placeholder plus the known stored literals.
      const placeholderTitles = new Set([
        'New Chat', 'New chat',
        'Новый чат',                                 // ru (stored before this fix)
        this.t('chat.header.new_chat_title'),        // whatever the active locale uses
      ]);
      if (session && meta?.destination && (!session.title || placeholderTitles.has(session.title))) {
        const dayWord = meta.daysCount === 1 ? this.t('chat.itinerary.day') : this.t('chat.itinerary.days');
        session.title = `${meta.destination} · ${meta.daysCount} ${dayWord}`;
      }
      if (this.isTokenValid()) { await this.saveCurrentSession(); }
    },
    // ── Clarifier open/close: animate to the element's real height so the
    //    open feels exactly as smooth as the close (no fixed max-height
    //    overshoot). overflow is clamped during the tween, then released. ──
    clarifierEnter(el, done) {
      // Measure the natural padding + full height BEFORE collapsing, so we can
      // animate both height AND padding from 0 — otherwise the last ~20px (the
      // fixed top/bottom padding) can't compress and the tail of the tween snaps.
      const cs = getComputedStyle(el);
      const padTop = cs.paddingTop, padBottom = cs.paddingBottom;
      const fullH = el.scrollHeight;
      el.style.overflow = 'hidden';
      el.style.height = '0';
      el.style.paddingTop = '0';
      el.style.paddingBottom = '0';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      // force a reflow so the starting values are committed before transitioning
      void el.offsetHeight;
      el.style.transition = 'height 0.3s cubic-bezier(0.16,1,0.3,1),padding 0.3s cubic-bezier(0.16,1,0.3,1),opacity 0.3s cubic-bezier(0.16,1,0.3,1),transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      el.style.height = fullH + 'px';
      el.style.paddingTop = padTop;
      el.style.paddingBottom = padBottom;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'height') return;
        el.removeEventListener('transitionend', handler);
        done();
      });
    },
    clarifierAfterEnter(el) {
      // release the fixed height / inline padding so wrapped chips / reflow stay correct
      el.style.height = 'auto';
      el.style.overflow = '';
      el.style.transition = '';
      el.style.transform = '';
      el.style.paddingTop = '';
      el.style.paddingBottom = '';
    },
    clarifierLeave(el, done) {
      const cs = getComputedStyle(el);
      el.style.overflow = 'hidden';
      el.style.height = el.scrollHeight + 'px';
      el.style.paddingTop = cs.paddingTop;
      el.style.paddingBottom = cs.paddingBottom;
      el.style.opacity = '1';
      void el.offsetHeight;
      el.style.transition = 'height 0.28s linear,padding 0.28s linear,opacity 0.18s linear,transform 0.28s linear';
      el.style.height = '0';
      el.style.paddingTop = '0';
      el.style.paddingBottom = '0';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'height') return;
        el.removeEventListener('transitionend', handler);
        done();
      });
    },
    shouldShowViewMore(message) {
      if (!message.actionType || message.streaming || message.isLoadingMore) return false;
      const action = this.quickActions.find(a => a.id === message.actionType);
      if (!action) return false;
      const count = message.recommendations?.length || 0;
      const currentCount = message.viewMoreCount || 0;
      // Show "View More" whenever this batch returned MORE THAN ONE result and we
      // haven't hit the tap cap — not only when the grid filled to defaultCount.
      // A short-but-real batch (e.g. 6/7 luxury hotels in a small city) still has
      // more to offer: the next tap excludes what's shown and pulls fresh names.
      // A lone result (or none) means the system effectively couldn't find more for
      // this area, so we don't dangle a button that loads an empty/near-empty screen.
      // (Previously required recommendations.length >= action.defaultCount, which
      // wrongly hid the button on any under-target batch.)
      const MIN_RESULTS_FOR_MORE = 2;
      return count >= MIN_RESULTS_FOR_MORE && currentCount < 3;
    },
    stopStreaming() {
      // console.log('🛑 Stop streaming called');
      // Abort any in-flight itinerary generation (self-managed fetches inside
      // <ItineraryView> — the shared abortController below doesn't cover them).
      if (this._itinViews) {
        Object.values(this._itinViews).forEach(v => { try { v && v.abortGeneration && v.abortGeneration(); } catch (_) {} });
      }
      if (this.abortController) {
        // console.log('⏹️ Aborting controller...');
        this.abortController.abort();
        this.abortController = null;
      }
      this.isStreaming = false;
      this.isTyping = false;
      this.isRequestPending = false;
      const lastAiMessage = [...this.messages].reverse().find(m => m.sender === 'ai');
      if (lastAiMessage && lastAiMessage.streaming) {
        const messageIndex = this.messages.findIndex(m => m.id === lastAiMessage.id);
        if (messageIndex !== -1) {
          if (this.messages[messageIndex].isChatRecommendation) {
            if (this.messages[messageIndex].recommendations) {
              this.messages[messageIndex].recommendations = this.messages[messageIndex].recommendations.map(rec => ({
                ...rec,
                category: rec.category === 'Searching...' ? 'Venue' : (rec.category || 'Venue'),
                region: rec.region === 'Searching location...' ? '' : (rec.region || ''),
                location: rec.location === 'Searching...' ? '' : (rec.location || ''),
                address: rec.address === 'Searching...' ? '' : (rec.address || rec.location || ''),
                description: rec.description || rec.name,
                metadata: {...rec.metadata, interrupted: true, wasStreaming: true}
              }));
            }
            const contentParts = [];        
            if (this.messages[messageIndex].textSections) { this.messages[messageIndex].textSections.forEach(section => { contentParts.push({type: 'text', content: section.content}) }) }        
            if (this.messages[messageIndex].currentText?.trim()) { contentParts.push({ type: 'text', content: this.messages[messageIndex].currentText }) }        
            if (this.messages[messageIndex].recommendations) { this.messages[messageIndex].recommendations.forEach((rec, index) => { contentParts.push({ type: 'recommendation', index: index }) }) }        
            this.messages[messageIndex].contentParts = contentParts;
            this.messages[messageIndex].textSections = null;
            this.messages[messageIndex].currentText = null;
          }
          this.messages[messageIndex].streaming = false;
          this.$forceUpdate();
        }
      }
    },
    // Keep a (non-reactive) handle on each message's RecommendationMap instance
    // so we can imperatively close it (e.g. when "View More" is pressed).
    // Rotating genie greeting (founder 2026-08-31): time-bucketed by the
    // PHONE's local hour, one line per visit (memoized — no re-roll on
    // re-render), 25% chance of an evergreen genie line. Every line is an
    // INVITATION, never a yes/no question — the greeting is UI only, the
    // backend never sees it, so a bare "yes" reply could never be resolved.
    // Missing translation falls back to the classic how_can_help. The last
    // space becomes a no-break space so a single word never wraps alone.
    greetingLine() {
      if (!this._greetKey) {
        const h = new Date().getHours();
        const slot = h >= 5 && h < 11 ? 'm' : h >= 11 && h < 17 ? 'a' : h >= 17 && h < 22 ? 'e' : 'n';
        this._greetKey = Math.random() < 0.25
          ? `chat.greeting.g${1 + Math.floor(Math.random() * 3)}`
          : `chat.greeting.${slot}${1 + Math.floor(Math.random() * 3)}`;
      }
      const tt = this.t || this.$t;
      let line = tt.call(this, this._greetKey);
      if (!line || line === this._greetKey) line = tt.call(this, 'chat.greeting.how_can_help');
      this._greetText = line;   // the send path materializes this as Jinni's first bubble
      // Mobile: break the sentence OURSELVES near its midpoint. Pre-broken
      // lines make width:max-content shrink-wrap the box to the true longest
      // line — lamp gap becomes exactly the flex gap, centering is pure CSS,
      // and no runtime measuring is involved (the iOS saga, final form).
      if (window.innerWidth <= 768 && line.length > 28) {
        const mid = Math.floor(line.length / 2);
        let best = -1;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === ' ' && (best === -1 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
        }
        if (best > 0) line = line.slice(0, best) + '\n' + line.slice(best + 1);
      }
      return line.replace(/ (\S+)$/, '\u00A0$1');
    },
    // Mobile centering (founder rounds 3-4): a wrapped text box always fills
    // the remaining row width, so lamp+text could never center as a pair by
    // CSS alone. The greeting is static per visit, so measure once: unwrapped
    // width W; if it fits, box = W (one line); if not, box ≈ W/2 + a word of
    // tolerance — text-wrap:balance evens the two lines inside it. Then the
    // container's justify-content:center finally has a shrink-wrapped pair.
    // Every event that changes text width re-fits through here: mount,
    // new chat, font load, language switch, display-pref change, resize/
    // rotation. The measure is idempotent, so a settle-window of retries
    // costs nothing and beats guessing which single moment is "after
    // layout" on every phone (founder: left-stuck "in lots of situations").
    _fitGreetingSoon() {
      [0, 200, 600, 1400].forEach(d => setTimeout(() => this._fitGreeting(), d));
    },
    _fitGreeting() {
      try {
      const el = this.$el?.querySelector?.('.greeting');
      if (!el) return;
      // Retired 2026-09-01: the greeting now pre-breaks its own line and
      // shrink-wraps via width:max-content — pure CSS. The measurer only
      // ever fought it (and never ran on iOS anyway). Clear any residue.
      el.style.maxWidth = ''; el.style.width = '';
      return;
      if (window.innerWidth > 768) { el.style.maxWidth = ''; return; }
      // Measured too early (pre-layout clientWidth 0, or fonts not ready →
      // scrollWidth 0): computed a junk box, browser ignored the invalid
      // width, text swallowed the row and pinned the pair LEFT (founder's
      // IMG_1501). Retry until the layout is real.
      const parentW = el.parentElement?.clientWidth || 0;
      if (parentW < 120) {
        if ((this._greetFitTries = (this._greetFitTries || 0) + 1) <= 20) setTimeout(() => this._fitGreeting(), 200);
        return;
      }
      el.style.maxWidth = 'none';
      const prevWS = el.style.whiteSpace;
      el.style.whiteSpace = 'nowrap';
      const w = el.scrollWidth;
      el.style.whiteSpace = prevWS || '';
      if (w < 40) {
        if ((this._greetFitTries = (this._greetFitTries || 0) + 1) <= 20) setTimeout(() => this._fitGreeting(), 200);
        return;
      }
      const avail = parentW - 100;
      // However many lines this language needs at this width (1, 2, 3…):
      // divide the unwrapped width across them, plus a word of tolerance,
      // clamped to what the row can hold. Balance evens the lines inside.
      // THE chronic left-stick (founder, many rounds): when w/lines needed
      // (nearly) the FULL available width — common with Elegant+Large —
      // the box had zero slack and nothing could center. Divide against
      // 90% of the space instead: one more, narrower line when needed,
      // guaranteeing visible slack for the pair to center in.
      const lines = Math.max(1, Math.ceil(w / (avail * 0.9)));
      const box = Math.min(Math.floor(avail * 0.92), Math.ceil(w / lines) + 28) + 'px';
      el.style.maxWidth = box;
      el.style.width = box;
      // The lamp keeps the text's scale (founder: a 44px lamp beside one
      // short line reads oversized): 1 line → petite, 2 → standard, 3+ → tall.
      const icon = this.$el.querySelector('.greeting-icon');
      if (icon) icon.style.height = lines === 1 ? '28px' : lines === 2 ? '38px' : '46px';
      } catch (e) { /* a failed fit must never break the chat */ }
    },
    // A session titled "New Chat" keeps the language it was CREATED in —
    // stored titles don't retranslate. Display-level fix (founder
    // 2026-09-01): any known new-chat placeholder renders in the CURRENT
    // language; real (generated/user) titles pass through untouched.
    displayTitle(title) {
      const NEW_CHAT_TITLES = new Set(['New Chat', 'New chat', 'Новый чат', 'Նոր զրույց', 'محادثة جديدة', '新对话', 'Nouvelle discussion']);
      if (!title || NEW_CHAT_TITLES.has(title)) {
        const tt = this.t || this.$t;
        return tt.call(this, 'chat.header.new_chat_title');
      }
      return title;
    },
    registerRecMap(id, el) {
      if (!this._recMaps) this._recMaps = {};
      if (el) this._recMaps[id] = el;
      else delete this._recMaps[id];
    },
    // Chat→map bridge v3 (founder 2026-08-31: "show go to map button instead
    // of opening map; after clicking navigate to full screen and route
    // calculated"). The transport answer carries its own card +
    // metadata.routeTo — a "See route" button renders on that message;
    // tapping it opens ITS map in fullscreen and runs the exact
    // Tap-for-distance flow. Nothing auto-opens (the old auto-route also
    // raced message state and traced on the previous deck's map).
    routeCtaFor(message) {
      const target = message?.metadata?.routeTo;
      if (!target) return null;
      const norm = s => String(s || '').toLowerCase().trim();
      const has = (message.recommendations || []).some(r =>
        (target.placeId && r.placeId && r.placeId === target.placeId)
        || (target.name && norm(r.name) === norm(target.name)));
      return has ? target : null;
    },
    openRouteFullscreen(message) {
      const target = this.routeCtaFor(message);
      const map = this._recMaps?.[message.id];
      if (target && map) { try { map.routeToPlace(target, { fullscreen: true }); } catch (e) { /* best-effort */ } }
    },
    async handleViewMore(message) {
      if (this.isOnCooldown) {
        // console.log('🚫 View More blocked - user on cooldown');\
        this.showCooldownMessage(this.usageStatus);
        return;
      }
      if (this.isRequestPending) { return }
      // Close the open map immediately so it doesn't sit above the new results.
      const recMap = this._recMaps && this._recMaps[message.id];
      if (recMap && typeof recMap.close === 'function') recMap.close();
      // Track view more click (non-blocking)
      try {
        fetch(`${API_BASE_URL}/api/ai/track-interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ verifiedId: null, placeName: null, interactionType: 'view_more_clicked', metadata: { actionType: message.actionType, viewMoreCount: message.viewMoreCount || 0 } })
        }).catch(() => {});
      } catch (_) {}
      this.isRequestPending = true;
      this.isStreaming = true;
      /* Local controller for THIS refill — see the note in the quick-action
       * handler below. stopStreaming() nulls the shared field, and the awaits
       * before the fetch make that a live race, not a theoretical one. */
      const reqController = new AbortController();
      this.abortController = reqController;
      try {
        const actionId = message.actionType;
        const currentCount = message.viewMoreCount || 0;
        const excludePlaceIds = [];
        const excludeNames = [];
        this.messages.forEach(msg => {
          if (msg.actionType === actionId && msg.recommendations) {
            msg.recommendations.forEach(rec => {
              if (rec.placeId) excludePlaceIds.push(rec.placeId);
              if (rec.name) {
                const cleanName = rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
                excludeNames.push(cleanName);
              }
            });
          }
        });
        const action = this.quickActions.find(a => a.id === actionId);
        if (currentCount >= 3) {
          const suggestionMessage = {
            id: Date.now(),
            sender: 'ai',
            text: `I've shown you quite a few ${action.label.toLowerCase()} options! To get more specific recommendations, try asking me something like:
                • "Show me ${action.label.toLowerCase()} with outdoor seating"
                • "I need ${action.label.toLowerCase()} near [specific area]"
                • "Show me ${action.label.toLowerCase()} for families"
                What specific type of ${action.label.toLowerCase()} are you looking for?`,
            timestamp: new Date(),
            isViewMoreSuggestion: true
          };
          this.messages.push(suggestionMessage);
          this.scrollToBottom();
          return;
        }
        const viewMoreBatchSize = action.defaultCount + 2;
        const originalMessageIndex = this.messages.findIndex(m => m.id === message.id);
        if (originalMessageIndex === -1) return;
        this.messages[originalMessageIndex].isLoadingMore = true;
        this.$forceUpdate();
        this.scrollToBottom();
        this.messages[originalMessageIndex].viewMoreCount = currentCount + 1;
        try {
          let location = null;
          const locationCacheValid = this.userLocation?.timestamp && (Date.now() - this.userLocation.timestamp < 300000);
          if (locationCacheValid) { location = this.userLocation } 
          else {
            if (this.locationPermission !== 'denied') { location = await this.getCurrentLocation() }
            if (!location) {
              location = await this.getLocationFromIP();
              if (location) { this.userLocation = location }
            }
          }
          const requestBody = {
            action: actionId,
            count: viewMoreBatchSize,
            actionType: 'view_more',
            // The backend decides "has this event already passed?" against the
            // start of TODAY IN THE USER'S OWN DAY. Only chat-stream ever sent
            // this, so every quick-action tap fell back to UTC — and in any zone
            // ahead of UTC that made yesterday's all-day events look current
            // during the first hours of each day (three stale Aug-12 cards at
            // 02:35 in Yerevan).
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // Which View More tap this is (1 = first View More, 2 = second, …).
            // The backend uses this to gate web search to the FIRST request only
            // and to prefer cache on refills. currentCount was already incremented
            // above, so it reflects this tap.
            viewMoreCount: currentCount + 1,
            excludePlaceIds: [...new Set(excludePlaceIds)],
            excludeNames: [...new Set(excludeNames)],
            nearbyMode: this.nearbyMode,
            // Keep the same shopping sub-type when loading more, otherwise the
            // next batch would revert to generic shops. Fallback to the last
            // chip the user picked — prod 2026-08-20: a third tap arrived
            // sub-typeless and served generic shops under a Malls grid.
            ...((message.subType || (message.actionType === 'shopping' && this._lastShoppingSubType))
              && { subType: message.subType || this._lastShoppingSubType })
          };
          // Re-stamp the message so every FOLLOWING tap carries it again.
          if (!message.subType && requestBody.subType) { message.subType = requestBody.subType; }
          if (location) { requestBody.location = { lat: location.lat, lng: location.lng, radius: location.source === 'ip' ? 50000 : 20000, source: location.source } }
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${API_BASE_URL}/api/ai/quick-action-stream`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(requestBody), signal: reqController.signal });
          this.applyUsageHeaders(response.headers);
          if (!response.ok) { throw new Error(`Server responded with ${response.status}: ${response.statusText}`) }
          await this.processViewMoreStream(response, originalMessageIndex);
        } catch (error) {
          console.error('View more failed:', error);
          setTimeout(() => {this.messages[originalMessageIndex].isLoadingMore = false}, 600);
          this.$forceUpdate();
          const errorMessage = { id: Date.now(), sender: 'ai', text: this.t('chat.errors.load_more_failed'), timestamp: new Date() };
          this.messages.push(errorMessage);
        }
      } finally {
        this.isRequestPending = false;
        this.isStreaming = false;
        await this.saveCurrentSession();
      }
    },
    getActionLabel(actionType) {return this.t(`chat.actions.${actionType}`) || actionType},
    getViewMoreHint(message) {
      const currentCount = message.viewMoreCount || 0;
      const remaining = 3 - currentCount;
      if (remaining === 3) { return this.t('chat.view_more.hint_first') } 
      else if (remaining === 2) { return this.t('chat.view_more.hint_second') } 
      else if (remaining === 1) { return this.t('chat.view_more.hint_last') }
      return "";
    },
    handleEnterKey(event) {
      if (!this.isDesktop) {
        event.preventDefault();
        const textarea = this.$refs.chatInput;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        this.userInput = this.userInput.substring(0, start) + '\n' + this.userInput.substring(end);
        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          this.adjustTextareaHeight();
        });
        return;
      }
      event.preventDefault();
      if (this.isStreaming){ return }
      this.sendMessage();
    },
    handleShiftEnter() { this.$nextTick(() => { this.adjustTextareaHeight() }) },
    adjustTextareaHeight() {
      const textarea = this.$refs.chatInput;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    },
    toggleNearbyMode() {
      this.nearbyMode = !this.nearbyMode;
      localStorage.setItem('nearbyMode', this.nearbyMode.toString());
      // Briefly show "Switched to <mode> mode" in the input placeholder, then
      // revert. Re-toggling restarts the timer rather than stacking.
      const modeName = this.t(this.nearbyMode ? 'chat.input.mode_nearby' : 'chat.input.mode_discovery');
      // Mobile input-wrapper is short — the full "Switched to X mode" overflows,
      // so phones get the compact "X mode" variant. Live width check (not
      // this.isMobile, which is never set on this component).
      const shortNotice = window.innerWidth <= 768;
      this.modeSwitchNotice = this.t(shortNotice ? 'chat.input.switched_mode_short' : 'chat.input.switched_mode', { mode: modeName });
      clearTimeout(this.modeSwitchTimer);
      this.modeSwitchTimer = setTimeout(() => { this.modeSwitchNotice = '' }, 2500);
      const button = event.target.closest('.mode-toggle, .mobile-mode-toggle');
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => { button.style.transform = '' }, 150);
      }
    },
    async triggerQuickAction(actionId, opts = {}) {
      const subType = opts.subType || null;
      // Remembered as a View-More fallback: prod 2026-08-20 showed a third
      // refill tap arriving WITHOUT subType (grid reverted to generic shops,
      // even a university card) — if message.subType is ever lost, the last
      // chip the user picked is still the right answer.
      if (subType) this._lastShoppingSubType = subType;
      // Itinerary opens its own step-by-step setup (days -> hotel) and does
      // NOT search until Build. Intercept before any usage check, like shopping.
      if (actionId === 'itinerary') {
        if (this.isStreaming || this.isRequestPending || this.isOnCooldown) return;
        this.showMobileActions = false;
        this.showShoppingClarifier = false;
        this.itineraryDraft = { daysCount: 3, hotelName: '', pickHotel: false, hotelBreakfast: false };
        this._itinPrefillDestination = null;   // button flow → effective location, never a stale chat destination
        this.abortHotelPrefetch();   // stale prefetch from a previous attempt
        // Nearby mode is meant for "around me right now" — building a multi-day
        // itinerary inside the compact nearby radius is unusual, so confirm first.
        this.itineraryStep = this.nearbyMode ? 'confirmNearby' : 'days';
        this.$nextTick(() => this.scrollToBottom(true));
        return;
      }
      const action = this.quickActions.find(a => a.id === actionId);
      // Clarifier actions (Shopping) show a follow-up prompt attached to the
      // input box and do NOT search until the user picks a sub-type. This must
      // run BEFORE any usage check or streaming/state mutation so it costs
      // nothing and never blocks the input. Once a subType is supplied (via
      // selectShoppingType) we fall through to the normal search path below.
      if (action?.clarify && !subType) {
        if (this.isStreaming || this.isRequestPending || this.isOnCooldown) return;
        const barWasVisible = this.showPreferenceBar;
        this.showMobileActions = false;
        const openClarifier = () => {
          this.barClosingForClarifier = false;
          this.showShoppingClarifier = true;
          this.$nextTick(() => { this.scrollToBottom(true) });
        };
        if (barWasVisible) {
          // Let the preference bar finish collapsing first, then open the
          // clarifier — so the two never animate in the same slot at once.
          this.barClosingForClarifier = true;
          setTimeout(openClarifier, 550);
        } else { openClarifier() }
        return;
      }
      const usageStatus = await this.checkUsageStatus();
      if (usageStatus?.cooldown?.active) {
        this.showCooldownMessage(usageStatus);
        return;
      }
      this.showMobileActions = false;
      if (this.isStreaming) {
        // console.log('🛑 Stop streaming triggered from quick action');
        this.stopStreaming();
        return;
      }
      if (this.isRequestPending) { 
        // console.log('🚫 Quick action blocked - request pending');
        return; 
      }
      this.isRequestPending = true;
      if (!this.isTokenValid()) {
        this.handleTokenExpiration();
        return;
      }
      this.isStreaming = true;
      /* Hold THIS request's controller in a local, and abort on the local.
       *
       * `this.abortController` is set to null by stopStreaming(), and several
       * awaits sit between here and the fetch below — setSessionTitle() (a
       * network call), location acquisition (which can wait on the geolocation
       * permission prompt), and two $nextTicks. A Stop tap, or starting another
       * action, anywhere in that window nulled the field before the fetch read
       * it, and `signal: this.abortController.signal` threw
       * "TypeError: null is not an object (evaluating 'this.abortController.signal')".
       *
       * The shared field still drives Stop; the local is only what this one
       * fetch listens to, so it cannot be pulled out from under itself. */
      const reqController = new AbortController();
      this.abortController = reqController;
      const modeText = this.nearbyMode ? this.t('chat.input.mode_nearby') : this.t('chat.input.mode_discovery');
      // For shopping the bubble shows the chosen sub-type ("Discovery · Souvenirs")
      // so the conversation reads naturally; other actions just show the label.
      const actionLabel = subType  ? this.t(`chat.shopping.${subType}`)  : this.t(`chat.actions.${action.id}`);
      const userBubbleText = `${modeText} ${actionLabel}`;
      const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: userBubbleText, timestamp: new Date(), isQuickAction: true };
      this.messages.push(userMessage);
      this.$forceUpdate();
      await this.$nextTick(() => { this.scrollToBottom(true) });
      const userMessages = this.messages.filter(m => m.sender === 'user');
      if (userMessages.length === 1) {
        const titles = { 
          'restaurants': this.nearbyMode ? this.t('chat.session_titles.nearby_restaurants') : this.t('chat.session_titles.restaurant_recommendations'),
          'hotels': this.nearbyMode ? this.t('chat.session_titles.nearby_hotels') : this.t('chat.session_titles.hotel_suggestions'),
          'hidden_gems': this.t('chat.session_titles.hidden_gems'),
          'historical': this.t('chat.session_titles.historical'),
          'events': this.t('chat.session_titles.events'),
          'photo_spots': this.t('chat.session_titles.photo_spots'),
          'shopping': this.t('chat.session_titles.shopping'),
          'activities': this.t('chat.session_titles.activities')
        };
        await this.setSessionTitle(titles[actionId] || 'Quick Search');
      }  
      // subType is stored on the AI message so "View More" re-runs the SAME
      // shopping sub-type, and so a reloaded session keeps it (see ChatSession schema).
      const aiMessage = { id: Date.now(), sender: 'ai', text: '', streaming: true, timestamp: new Date(), actionType: actionId, subType: subType, viewMoreCount: 0, isViewMore: false };
      this.messages.push(aiMessage);
      this.$forceUpdate();
      await this.$nextTick(() => { this.scrollToBottomForAnimation() });
      try {
        const currentUsage = this.getTotalActionUsage(actionId);
        const totalRecsShown = this.getTotalRecommendationsShown(actionId);
        const action = this.quickActions.find(a => a.id === actionId);
        const limits = { 'restaurants': { maxRequests: 4, maxTotal: 35 }, 'hotels': { maxRequests: 4, maxTotal: 25 }, 'historical': { maxRequests: 4, maxTotal: 25 }, 'hidden_gems': { maxRequests: 4, maxTotal: 20 }, 'events': { maxRequests: 4, maxTotal: 40 }, 'photo_spots': { maxRequests: 4, maxTotal: 30 }, 'shopping': { maxRequests: 4, maxTotal: 35 }, 'activities': { maxRequests: 4, maxTotal: 30 } };
        const limit = limits[actionId] || { maxRequests: 3, maxTotal: 20 };
        if (currentUsage >= limit.maxRequests || totalRecsShown >= limit.maxTotal) {
          const suggestionMessage = { id: Date.now(), sender: 'ai', text: this.generateLimitMessage(actionId, action.label), timestamp: new Date(), isLimitReached: true };
          const streamingIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (streamingIndex !== -1) { this.messages.splice(streamingIndex, 1) }
          this.messages.push(suggestionMessage);
          this.scrollToBottom();
          this.isStreaming = false;
          this.isRequestPending = false;
          this.abortController = null;
          return;
        }
        const excludePlaceIds = [];
        const excludeNames = [];
        this.messages.forEach(msg => {
          if (msg.actionType === actionId && msg.recommendations) {
            msg.recommendations.forEach(rec => {
              if (rec.placeId) excludePlaceIds.push(rec.placeId);
              if (rec.name) {
                const cleanName = rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
                excludeNames.push(cleanName);
              }
            });
          }
        });
        const count = action.defaultCount;
        let location = null;
        const locationCacheValid = this.userLocation?.timestamp && (Date.now() - this.userLocation.timestamp < 300000);
        if (locationCacheValid) { location = this.userLocation } 
        else {
          if (this.locationPermission !== 'denied') { location = await this.getCurrentLocation() }
          if (!location) {
            location = await this.getLocationFromIP();
            if (location) { this.userLocation = location }
          }
        }
        // userTimezone: the events past-filter needs the user's own day boundary,
        // not UTC — see the note on the View More body above.
        const requestBody = { action: actionId, count: count, actionType: 'quick_action', userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, excludePlaceIds: [...new Set(excludePlaceIds)], excludeNames: [...new Set(excludeNames)], nearbyMode: this.nearbyMode, ...(subType && { subType }) };
        if (location) { 
          requestBody.location = { 
            lat: location.lat, 
            lng: location.lng, 
            radius: location.source === 'ip' ? 50000 : 20000, 
            source: location.source 
          } 
        }
        const token = localStorage.getItem('authToken');
        if (!token) {
          this.handleTokenExpiration();
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/ai/quick-action-stream`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(requestBody), signal: reqController.signal });
          this.applyUsageHeaders(response.headers);
        if (response.status === 401) {
          this.handleTokenExpiration();
          return;
        }
        if (response.status === 429) {
          const errorData = await response.json();
          this.showCooldownMessage({ cooldown: { active: true, hoursRemaining: Math.ceil((new Date(errorData.cooldownUntil) - new Date()) / (1000 * 60 * 60)), reason: errorData.reason } });
          return;
        }
        if (response.status === 400) {
          const errorData = await response.json();
          // console.log('Location error:', errorData);      
          const userMsgIndex = this.messages.findIndex(m => m.id === userMessage.id);
          if (userMsgIndex !== -1) { this.messages.splice(userMsgIndex, 1) }
          const aiMsgIndex = this.messages.findIndex(m => m.id === aiMessage.id);
          if (aiMsgIndex !== -1) { this.messages.splice(aiMsgIndex, 1) }
          const locationErrorMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: errorData.userMessage || 'Please set your travel destination in Settings or enable GPS location detection.',
            timestamp: new Date(),
            isLocationError: true,
            quickActions: ['Open Settings']
          };
          this.messages.push(locationErrorMessage);
          this.$forceUpdate();
          this.scrollToBottom(true);
          this.isTyping = false;
          this.isStreaming = false;
          this.isRequestPending = false;
          this.abortController = null;
          return;
        }
        if (!response.ok) {
          let errorDetails = '';
          try { errorDetails = await response.text() } catch {}
          throw new Error(`Server responded with ${response.status}: ${errorDetails || response.statusText}`);
        }
        this.updateUsageFromResponse(response);
        await this.processQuickActionStream(response, aiMessage);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Quick action aborted by user');
          return;
        }
        console.error('Quick action failed:', error);
        const idx = this.messages.findIndex(m => m.id === aiMessage.id);
        if (idx > -1) {
          let errorMessage = this.t('chat.errors.recommendations_error');
          if (error.message.includes('401')) {
            this.handleTokenExpiration();
            return;
          } 
          else if (error.message.includes('429')) { return } 
          else if (error.message.includes('500')) { errorMessage = this.t('chat.errors.server_error') } 
          else if (!navigator.onLine) { errorMessage = this.t('chat.errors.offline') }
          this.messages[idx].text = errorMessage;
          this.messages[idx].streaming = false;
          this.$forceUpdate();
        }
      } finally {
        this.isTyping = false;
        this.isStreaming = false;
        this.abortController = null;
        if (this.isTokenValid()) { await this.saveCurrentSession() }
        this.isRequestPending = false;
        await this.updateUsageStatus();
      }
    },
    editPreferences() {
      this.$router.push('/onboarding?editing=true');
      this.showProfileModal = false;
    },
    // Preference context bar: open the edit page, optionally deep-linking to a
    // section. Called with an explicit string (or nothing) so no event object
    // can leak into the query — kept separate from editPreferences() which is
    // bound directly to @click elsewhere and receives the event as its arg.
    goEditPreferences(section) {
      const base = '/onboarding?editing=true';
      this.$router.push(typeof section === 'string' && section ? `${base}&section=${section}` : base);
    },
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      this.localUser = null;
      this.showProfileMenu = false;
      this.$router.push('/');
      this.showProfileModal = false;
    },
    formatInterest(interest) {return this.t(`onboarding.interests.${interest}`) || interest},
    isDefaultBudget(budget) { return budget.min === 0 && budget.max === 0 },
    formatBudget(budget) {
      const min = budget.min?.toLocaleString() || 'No min';
      const max = budget.max?.toLocaleString() || 'No max';
      return `${min} - ${max} ${budget.currency || 'USD'}`;
    },
    formatTravelStyle(style) {
      if (!style) return null;
      return this.t(`onboarding.styles.${style}`) || style;
    },
    formatLanguage(langCode) {
      const languages = { 'en': 'English', 'ru': 'Russian', 'fr': 'French' };
      return languages[langCode] || langCode.toUpperCase();
    },
    closeInfoModal() {
      document.removeEventListener('keydown', this.onInfoModalEsc, true);
      this.showInfoModal = false;
      this.selectedPlace = null;
      this.placeDetails = null;
      this.showAllHours = false;
    },
    onInfoModalEsc(e) {
      if (e.key !== 'Escape' || !this.showInfoModal) return;
      // Capture phase: stop here so the map's own Esc handler (which would exit
      // fullscreen) doesn't also fire — Escape just closes the modal.
      e.stopPropagation();
      e.preventDefault();
      this.closeInfoModal();
    },
    shouldShowRating(place) {
      if (!place) return false;
      const category = (place.category || '').toLowerCase();
      return category.includes('restaurant') || category.includes('hotel') || category === 'restaurant' || category === 'hotel';
    },
    onMapMarkerClick({ rec }) {
      // A pin on the recommendation map was tapped. Log the intent here; this
      // is also the hook for scrolling to / highlighting the matching card.
      try { this.trackInteraction(rec, 'map_marker_click'); } catch (e) {}
    },
    onMapTrack({ rec, type }) {
      // Quick-action buttons inside a map popup (Call / Website / Directions)
      // route through the same trackInteraction the chat cards + info-modal use,
      // so the map records activity identically (verifiedId resolution +
      // cross-session "view" notifications stay consistent).
      try { this.trackInteraction(rec, type); } catch (e) {}
    },
    openInMaps() {
      this.trackInteraction(this.selectedPlace, 'map_open');
      /* Coordinates FIRST, from either source. Events have no placeId (so no
       * placeDetails), but venue resolution gave the rec itself lat/lng — a
       * name search like "Horizon Festival" finds nothing on Maps, while the
       * venue pin (Garni temple) is exactly where the user must go. */
      const sp = this.selectedPlace || {};
      const g = this.placeDetails?.geometry?.location;
      const lat = g?.lat ?? sp.latitude, lng = g?.lng ?? sp.longitude;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
      } else if (sp.name) {
        // No hardcoded country — the card's own address/location is the
        // context, wherever in the world the user is.
        const ctx = sp.location || sp.address || sp.region || '';
        const query = encodeURIComponent(`${sp.name} ${ctx}`.trim());
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
    },
    searchOnline() {
      this.trackInteraction(this.selectedPlace, 'search_click');
      const query = encodeURIComponent(`${this.selectedPlace.name}`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },
    openFullscreenModal(images) {
      this.fullscreenImages = images.map(img => ({...img, url: this.getImageUrl(img.url || img.src), title: img.title || img.alt || 'Image'}));
      this.currentFullscreenIndex = 0;
      this.showFullscreenModal = true;
      this.fullscreenLoading = false;
      document.body.style.overflow = 'hidden';
    },
    closeFullscreenModal() {
      this.showFullscreenModal = false;
      this.fullscreenImages = [];
      this.currentFullscreenIndex = 0;
      this.fullscreenLoading = false;
      this.isRequestingImages = false;
      document.body.style.overflow = '';
    },
    nextFullscreenImage() { if (this.currentFullscreenIndex < this.fullscreenImages.length - 1) { this.currentFullscreenIndex++ } },
    previousFullscreenImage() { if (this.currentFullscreenIndex > 0) { this.currentFullscreenIndex-- } },
    handleFullscreenImageLoad() { this.fullscreenLoading = false },
    handleFullscreenKeyDown(event) {
      if (!this.showFullscreenModal) return;
      if (event.key === 'ArrowRight') { this.nextFullscreenImage() } 
      else if (event.key === 'ArrowLeft') { this.previousFullscreenImage() } 
      else if (event.key === 'Escape') { this.closeFullscreenModal() }
    },
    async initializeChat() {
      try {
        await this.loadChatSessions();
        const lastActiveId = localStorage.getItem('lastActiveChatId');
        if (lastActiveId && this.chatSessions.some(s => s.id === lastActiveId)) { await this.loadChatSession(lastActiveId) } 
        else if (this.chatSessions.length > 0) { await this.loadChatSession(this.chatSessions[0].id) } 
        else { await this.startNewChat() }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (error.response && error.response.status === 401) {
          this.handleTokenExpiration();
          return;
        }
        await this.startNewChat();
      }
    },
    getRecommendationId(recommendation) { return recommendation.placeId || recommendation.id || recommendation.name.replace(/\s+/g, '_'); },
    cleanOldImageCache() {
      try {
        const now = Date.now();
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('jinni_images_')) {
            try {
              const cached = JSON.parse(localStorage.getItem(key));
              if (cached.expiresAt && now > cached.expiresAt) { keysToRemove.push(key); }
            } catch (e) { keysToRemove.push(key) }
          }
        }
        keysToRemove.forEach(key => { localStorage.removeItem(key); });
      } catch (error) { console.warn('Error cleaning cache:', error) }
    },
    async getCurrentLocation() {
      // Respect the onboarding choice. If auto-detect (GPS) is explicitly OFF — the
      // user picked a fixed DESTINATION, not "use my location" — never call the
      // browser geolocation API, which is what pops the "allow location" prompt.
      // Return null so callers fall through to the chosen destination. This one
      // guard covers every caller (the on-entry warm-up AND each message send), so
      // the prompt can't appear in destination mode. `=== false` (not `!`) keeps GPS
      // working for users whose settings are default/missing (app default is on),
      // and turning GPS on in settings sets the flag true first, so opt-in still works.
      if (this.userSettings?.privacy?.autoDetectLocation === false) return null;
      if (!window.isSecureContext) {
        // console.log('⚠️ Not in secure context, using IP-based location');
        const ipLocation = await this.getLocationFromIP();
        if (ipLocation) { this.userLocation = { ...ipLocation, timestamp: Date.now(), source: 'ip' } }
        return this.userLocation;
      }
      try {
        const position = await new Promise((resolve, reject) => { navigator.geolocation.getCurrentPosition( resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } ) });
        this.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: Date.now(), source: 'gps' };
        this.locationPermission = 'granted';
        return this.userLocation;
      } catch (error) {
        console.warn('Geolocation error:', error);
        if (error.code === 1) { this.locationPermission = 'denied' } 
        else if (error.code === 2) { this.locationPermission = 'unavailable' } 
        else if (error.code === 3) { this.locationPermission = 'timeout' } 
        else { this.locationPermission = 'unknown' }
        const ipLocation = await this.getLocationFromIP();
        if (ipLocation) {
          this.userLocation = { ...ipLocation, timestamp: Date.now(), source: 'ip' };
          return this.userLocation;
        }
        return null;
      }
    },
    async getLocationFromIP() {
      try {
        const token = localStorage.getItem('authToken');
        // Absolute API host: the relative path went to jinni.travel (the SPA),
        // Caddy served index.html, and JSON.parse failed with "The string did
        // not match the expected pattern" — the IP fallback never worked.
        const r = await fetch(`${API_BASE_URL}/api/ai/location/detect`, {headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(5000)});
        const d = await r.json();
        if (d.success && d.lat && d.lng) {return { lat: d.lat, lng: d.lng, accuracy: 10000, city: d.city, country: d.country, source: 'server', timestamp: Date.now() }}
      } catch (e) {console.warn('Backend location detect failed:', e.message)}
      return null;
    },
    handleTokenExpiration() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      const currentPath = this.$route.fullPath;
      this.$router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    },
    checkScreenSize() {
      if (this._fitGreetingSoon) this._fitGreetingSoon();
      this.isDesktop = window.innerWidth > 768;
      this.$forceUpdate();
    },
    generateLimitMessage(actionId, actionLabel) {
      const translatedLabel = this.t(`chat.actions.${actionId}`);   
      const messages = {
        'restaurants': this.t('chat.limit_suggestions.restaurants'),
        'hotels': this.t('chat.limit_suggestions.hotels'),
        'historical': this.t('chat.limit_suggestions.historical'),
        'hidden_gems': this.t('chat.limit_suggestions.hidden_gems'),
        'events': this.t('chat.limit_suggestions.events')
      };      
      return messages[actionId] || `I've shown you many ${translatedLabel.toLowerCase()} options! Try asking me something more specific about what you're looking for, and I'll help you find exactly what you need.`;
    },
    getTotalActionUsage(actionType) { return this.messages.filter(msg => msg.actionType === actionType && msg.sender === 'ai').length },
    getTotalRecommendationsShown(actionType) { return this.messages.filter(msg => msg.actionType === actionType && msg.recommendations).reduce((total, msg) => total + (msg.recommendations?.length || 0), 0) },
    async processViewMoreStream(response, messageIndex) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let newRecommendations = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'complete' && data.recommendations) {
                  const existingRecs = this.messages[messageIndex].recommendations || [];
                  const existingIds = new Set(existingRecs.map(rec => rec.placeId));
                  const existingNames = new Set(existingRecs.map(rec => rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim()));
                  newRecommendations = data.recommendations
                    .filter(rec => {
                      const shouldExclude = (rec.placeId && existingIds.has(rec.placeId)) || (rec.name && existingNames.has(rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim()));
                      return !shouldExclude;
                    })
                    .map(rec => {
                      const processedRec = { ...rec };
                      if (processedRec.distance === 'Near you km') { processedRec.distance = 'Near you' }
                      if (processedRec.distanceKm && (!processedRec.distance || processedRec.distance === 'Distance unknown')) {
                        if (processedRec.distanceKm > 0) { processedRec.distance = `${processedRec.distanceKm} km` } 
                        else { processedRec.distance = 'Near you' }
                      }
                      return processedRec;
                    });
                  const messageId = this.messages[messageIndex].id;
                  this.messages[messageIndex].isLoadingMore = false;
                  this.viewMoreAnimatingIds.add(messageId);
                  this.$forceUpdate();
                  setTimeout(async () => {
                    if (newRecommendations.length > 0) {this.messages[messageIndex].recommendations = [...(this.messages[messageIndex].recommendations || []), ...newRecommendations]}
                    this.viewMoreAnimatingIds.delete(messageId);
                    this.$forceUpdate();
                    if (this.isTokenValid()) { await this.saveCurrentSession() }
                  }, 1600);
                }
              } catch (parseError) { console.warn('Failed to parse streaming data:', parseError) }
            }
          }
          this.scrollToBottom();
        }
      } catch (error) {
        console.error('Stream processing failed:', error);
        this.messages[messageIndex].isLoadingMore = false;
        this.viewMoreAnimatingIds.delete(this.messages[messageIndex].id);
        this.$forceUpdate();
      } finally { this.scrollToBottom() }
    },
    shouldShowViewMoreLoading(message) {return message.isLoadingMore || this.viewMoreAnimatingIds.has(message.id)},
    async processQuickActionStream(response, aiMessage) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let hasContent = false;
      let errorOccurred = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
                if (messageIndex === -1) continue;
                if (data.type === 'token' && data.content) {
                  this.messages[messageIndex].text += data.content;
                  hasContent = true;
                  this.$forceUpdate();
                }
                if (data.type === 'complete' && data.recommendations) {
                  let processedRecommendations = data.recommendations.map(rec => {
                    const processedRec = { ...rec };
                    if (processedRec.distance === 'Near you km') { processedRec.distance = 'Near you' }
                    if (processedRec.distanceKm && (!processedRec.distance || processedRec.distance === 'Distance unknown')) {
                      if (processedRec.distanceKm > 0) { processedRec.distance = `${processedRec.distanceKm} km` } 
                      else { processedRec.distance = 'Near you' }
                    }
                    return processedRec;
                  });
                  
                  if (aiMessage.isViewMore) {
                    const existingRecs = this.messages[messageIndex].recommendations || [];
                    const existingIds = new Set(existingRecs.map(rec => rec.placeId));
                    const existingNames = new Set(existingRecs.map(rec => rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim()));
                    processedRecommendations = processedRecommendations.filter(rec => {
                      const shouldExclude = (rec.placeId && existingIds.has(rec.placeId)) || (rec.name && existingNames.has(rec.name.toLowerCase().replace(/[^\w\s]/g, '').trim()));
                      return !shouldExclude;
                    });
                  }
                  if (processedRecommendations.length > 0) { this.messages[messageIndex].recommendations = [...(this.messages[messageIndex].recommendations || []), ...processedRecommendations] } 
                  else { if (!aiMessage.isViewMore) { this.messages[messageIndex].recommendations = [] } }                  
                  this.messages[messageIndex].contentParts = data.contentParts || [];
                  this.streamingLampAnimatingIds.add(aiMessage.id);
                  this.messages[messageIndex].streaming = false;
                  this.$forceUpdate();
                  setTimeout(() => {
                    this.streamingLampAnimatingIds.delete(aiMessage.id);
                    this.$forceUpdate();
                  }, 2500);
                }
                if (data.type === 'error') {
                  errorOccurred = true;
                  const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
                  if (messageIndex !== -1) {
                    this.messages[messageIndex].text = data.message || 'An error occurred';
                    this.messages[messageIndex].streaming = false;
                    this.$forceUpdate();
                  }
                }
              } catch (parseError) { console.warn('Failed to parse streaming data:', parseError) }
            }
          }
        }
        this.isTyping = false;
        const messageIndex = this.messages.findIndex(m => m.id === aiMessage.id);
        if (messageIndex > -1) {
          if (!hasContent && !errorOccurred) { this.messages[messageIndex].text = this.t('chat.errors.no_recommendations') }
          this.$forceUpdate();
        }
      } catch (error) {
        console.error('Stream processing failed:', error);
        errorOccurred = true;
        this.isTyping = false;
        const idx = this.messages.findIndex(m => m.id === aiMessage.id);
        if (idx > -1) {
          this.messages[idx].text = this.t('chat.errors.recommendations_failed');
          this.messages[idx].streaming = false;
          this.$forceUpdate();
        }
      }
    },
    async loadUser() {
      if (!this.isTokenValid()) { return }
      this.loadingUserData = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        if (response.data && response.data.email) { this.localUser = response.data } 
        else if (response.data && response.data.user) { this.localUser = response.data.user } 
        else { console.error('Invalid response format:', response.data) }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (error.response?.status === 401) { this.handleTokenExpiration() }
      } finally { this.loadingUserData = false }
    },
    isTokenValid() {
      const token = localStorage.getItem('authToken');
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
      } catch { return false }
    },
    async generateChatTitle() {
      if (this.isGeneratingTitle) return;
      try {
        this.isGeneratingTitle = true;
        const token = localStorage.getItem('authToken');
        const userLanguage = navigator.language || 'en-US';
        const response = await axios.post(`${API_BASE_URL}/api/ai/generate-chat-title`, {messages: this.messages, language: userLanguage.split('-')[0]}, {headers: {Authorization: `Bearer ${token}`}});
        if (response.data.success && response.data.title) { await this.setSessionTitle(response.data.title) } 
        else { await this.setFallbackTitle() }
      } catch (error) {
        console.error('Title generation error:', error);
        await this.setFallbackTitle();
      } finally { this.isGeneratingTitle = false }
    },
    async setSessionTitle(title) {
      const sessionIndex = this.chatSessions.findIndex(s => s.id === this.activeSessionId);
      if (sessionIndex !== -1) {
        this.chatSessions[sessionIndex].title = title;
        await this.saveCurrentSession();
      }
    },
    async setFallbackTitle() {
      const firstUserMessage = this.messages.find(m => m.sender === 'user');
      if (firstUserMessage?.text) {
        const title = firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? "..." : "");
        await this.setSessionTitle(title);
      }
    },
    async loadChatSessions() {
      this.loadingSessions = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/chat-sessions`, {headers: {Authorization: `Bearer ${localStorage.getItem('authToken')}`}, params: {sort: '-updatedAt'}});
        this.chatSessions = response.data.map(session => ({...session, id: session._id}));
      } finally { this.loadingSessions = false }
    },
    getScrollContainer() { return this.$refs.scrollContainer?.querySelector?.('.scrollable-content') || null },
    isNearBottom() {
      const scrollable = this.getScrollContainer();
      if (!scrollable) return false;
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      return distanceFromBottom <= this.SCROLL_THRESHOLD;
    },
    scrollToBottom(force = false) {
      const scrollable = this.getScrollContainer();
      if (!scrollable) return;
      if (!force && this.userHasScrolledUp) { return }
      const now = Date.now();
      if (now - this.lastScrollTime < this.AUTO_SCROLL_COOLDOWN && !force) { return }
      this.lastScrollTime = now;
      this.isAutoScrolling = true;
      requestAnimationFrame(() => {
        scrollable.scrollTo({ top: scrollable.scrollHeight, behavior: 'smooth' });
        setTimeout(() => { this.isAutoScrolling = false }, 600);
      });
    },
    scrollToBottomForAnimation() {
      if (this.userHasScrolledUp) { return }
      const scrollable = this.getScrollContainer();
      if (!scrollable) return;
      requestAnimationFrame(() => { scrollable.scrollTop = scrollable.scrollHeight });
    },
    handleScrollCheck() {
      if (this.isAutoScrolling) { return }
      clearTimeout(this.scrollCheckDebounce);
      this.scrollCheckDebounce = setTimeout(() => {
        const scrollable = this.getScrollContainer();
        if (!scrollable) return;
        const nearBottom = this.isNearBottom();
        this.userHasScrolledUp = !nearBottom;
      }, 8); // 8 is aggressivly checking the scrolling, but normal for mac
    },
    setupScrollListener() {
      const scrollable = this.getScrollContainer();
      if (!scrollable) return;
      scrollable.addEventListener('scroll', this.handleScrollCheck, { passive: true });
      this.userHasScrolledUp = false;
    },
    removeScrollListener() {
      const scrollable = this.getScrollContainer();
      if (scrollable) { scrollable.removeEventListener('scroll', this.handleScrollCheck) }
      clearTimeout(this.scrollCheckDebounce);
    },
    setupSmartScrollObserver() {
      const scrollable = this.getScrollContainer();
      if (!scrollable) return;
      const observerOptions = { root: scrollable, threshold: 0 };
      this.messageObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting && !this.userHasScrolledUp) { this.scrollToBottom(false) } }) }, observerOptions);
      const lastMessage = scrollable.lastElementChild;
      if (lastMessage) { this.messageObserver.observe(lastMessage) }
    },
    updateScrollObserver() {
      if (!this.messageObserver) return;
      const scrollable = this.getScrollContainer();
      if (!scrollable) return;
      this.messageObserver.disconnect();
      const lastMessage = scrollable.lastElementChild;
      if (lastMessage) { this.messageObserver.observe(lastMessage) }
    },
    async checkUsageStatus() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/usage-status`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }});
        // console.log('📊 Usage status fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to check usage status:', error);
        return null;
      }
    },
    showCooldownMessage(usageStatus) {
      const cd = usageStatus.cooldown || {};
      const hoursRemaining = cd.hoursRemaining || 4;
      // Always carry an absolute end time so the input shows a concrete reactivation
      // time (and it stays stable across re-renders instead of recomputing). Use the
      // server's timestamp when present, else derive from hoursRemaining.
      const until = cd.until || new Date(Date.now() + hoursRemaining * 60 * 60 * 1000).toISOString();
      if (this.usageStatus) { this.usageStatus.cooldown = { active: true, hoursRemaining, until, reason: cd.reason } }
      // console.log('⏸️ Cooldown active:', { hoursRemaining });
    },  
    setupErrorHandling() {
      this.axiosInterceptor = axios.interceptors.response.use(
        response => {
          this.updateUsageFromResponse(response);
          return response;
        },
        error => {
          if (error.response?.status === 429) {
            const cooldownData = error.response.data;
            // console.log('⏸️ Cooldown detected:', cooldownData);
            this.showCooldownMessage({cooldown: { active: true, until: cooldownData.cooldownUntil || null, hoursRemaining: cooldownData.cooldownUntil ? Math.ceil((new Date(cooldownData.cooldownUntil) - new Date()) / (1000 * 60 * 60)) : 4, reason: cooldownData.reason }});        
            if (this.usageStatus) { this.usageStatus.cooldown = { active: true, until: cooldownData.cooldownUntil || null, hoursRemaining: cooldownData.cooldownUntil ? Math.ceil((new Date(cooldownData.cooldownUntil) - new Date()) / (1000 * 60 * 60)) : 4, reason: cooldownData.reason } }
            return Promise.reject(error);
          }
          if (error.response?.status === 401) { this.handleTokenExpiration() }
          return Promise.reject(error);
        }
      );
    },
    async startUsageMonitoring() {
      await this.updateUsageStatus();
      this.usageCheckInterval = setInterval(() => { this.updateUsageStatus() }, 60000); // Check every minute
    },
    async updateUsageStatus() {
      try {
        const status = await this.checkUsageStatus();
        if (status) {
          this.usageStatus = status;          
          if (status.daily.tokens.percentage > 80 || status.daily.places.percentage > 80) { this.showUsageWarning(status) }
        }
      } catch (error) { console.error('Failed to update usage status:', error) }
    },
    /* Quota warning, shown over the composer for USAGE_NOTICE_MS and then
       gone. It used to be pushed into `messages` as a fake AI turn, which
       left a permanent "you've used 83%" line in the transcript, saved with
       the session and re-read on every reload — and the text was hardcoded
       English while the i18n keys for it already existed unused.

       Re-shows once usage climbs another 10 points (83% -> 93%), rather than
       only ever once: a notice that disappears after five seconds is easy to
       miss, so once-per-session would often mean never seen. */
    showUsageWarning(status) {
      const pct = Math.max(status.daily.tokens.percentage || 0, status.daily.places.percentage || 0);
      if (this._usageNoticeAt != null && pct < this._usageNoticeAt + 10) return;

      const parts = [];
      // NOTE: these live at TOP-LEVEL usage.warning.* in the locale files —
      // 'chat.usage.…' doesn't exist and rendered as the raw key.
      if (status.daily.tokens.percentage > 80) parts.push(this.t('usage.warning.tokens', { percentage: status.daily.tokens.percentage }));
      if (status.daily.places.percentage > 80) parts.push(this.t('usage.warning.places', { percentage: status.daily.places.percentage }));
      if (!parts.length) return;
      parts.push(this.t('usage.warning.upgrade'));

      this._usageNoticeAt = pct;
      this.usageNotice = parts.join(' ');
      clearTimeout(this._usageNoticeTimer);
      this._usageNoticeTimer = setTimeout(() => { this.usageNotice = null; }, USAGE_NOTICE_MS);
    },
    extractUsageFromHeaders(response) {
      const headers = response.headers;
      if (!headers) return null;
      const tokensUsed = headers['x-usage-tokens-used'];
      const tokensRemaining = headers['x-usage-tokens-remaining'];
      const placesViewed = headers['x-usage-places-viewed'];
      const placesRemaining = headers['x-usage-places-remaining'];
      const requestsRemaining = headers['x-usage-requests-remaining'];
      if (tokensUsed !== undefined) {
        // console.log('📊 Usage from headers:', {tokensUsed,tokensRemaining,placesViewed,placesRemaining});
        return {
          daily: {
            tokens: { used: parseInt(tokensUsed) || 0, remaining: parseInt(tokensRemaining) || 0, limit: parseInt(tokensUsed) + parseInt(tokensRemaining) || 10000, percentage: Math.round((parseInt(tokensUsed) / (parseInt(tokensUsed) + parseInt(tokensRemaining))) * 100) },
            places: { viewed: parseInt(placesViewed) || 0, remaining: parseInt(placesRemaining) || 0, limit: parseInt(placesViewed) + parseInt(placesRemaining) || 50, percentage: Math.round((parseInt(placesViewed) / (parseInt(placesViewed) + parseInt(placesRemaining))) * 100) },
            // Token budget expressed in requests — same math as the server gate,
            // so this number can never contradict a 429 block.
            requests: { estimatedRemaining: requestsRemaining !== undefined ? (parseInt(requestsRemaining) || 0) : null }
          }
        };
      }
      return null;
    },
    updateUsageFromResponse(response) {
      const usageData = this.extractUsageFromHeaders(response);
      if (usageData) {
        if (this.usageStatus) {
          this.usageStatus.daily.tokens = usageData.daily.tokens;
          this.usageStatus.daily.places = usageData.daily.places;
          if (usageData.daily.requests && usageData.daily.requests.estimatedRemaining !== null) { this.usageStatus.daily.requests = usageData.daily.requests; }
        } else { this.usageStatus = { ...usageData, cooldown: { active: false, hoursRemaining: 0 }, isPremium: false } }
        // console.log('✅ Usage status updated from response');
        if (usageData.daily.tokens.percentage > 80 || usageData.daily.places.percentage > 80) { this.showUsageWarning(this.usageStatus) }
      }
    },
    handleCardTouchStart(recommendation, event) {
      const card = event.currentTarget.closest('.recommendation-card');
      if (card) { card.classList.add('touch-active') }
    },
    handleCardTouchEnd(recommendation, event) {
      const card = event.currentTarget.closest('.recommendation-card');
      if (card) { setTimeout(() => { card.classList.remove('touch-active') }, 200) }
    },
    async trackInteraction(rec, interactionType) {
      let resolvedVerifiedId = rec?.verifiedId || null;
      if (!resolvedVerifiedId && rec?.id && typeof rec.id === 'string' && rec.id.startsWith('db-')) {
        const candidate = rec.id.split('-').find(p => /^[a-f0-9]{24}$/i.test(p));
        if (candidate) resolvedVerifiedId = candidate;
      }
      const placeId = rec?.placeId || null;
      // Track when we have EITHER a verified DB id (for business analytics) OR a
      // Google placeId (for the per-user watched/view signal). Previously this
      // returned on no verifiedId, so Google places were never tracked at all.
      if (!resolvedVerifiedId && !placeId) return;
      // Build the list of other businesses interacted with this session (for crossInteractions)
      const otherSessionIds = resolvedVerifiedId ? this.sessionBusinessIds.filter(id => id !== resolvedVerifiedId) : [];
      // Add this business to the session list if not already there
      if (resolvedVerifiedId && !this.sessionBusinessIds.includes(resolvedVerifiedId)) {this.sessionBusinessIds.push(resolvedVerifiedId)}
      try { await fetch(`${API_BASE_URL}/api/ai/track-interaction`, {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}`}, body: JSON.stringify({verifiedId: resolvedVerifiedId, placeId, placeName: rec.name, interactionType, sessionBusinessIds: otherSessionIds})}) }
      catch (e) {}
      // Directly notify other businesses in the session about this cross-interaction
      if (resolvedVerifiedId && otherSessionIds.length) {
        try {
          fetch(`${API_BASE_URL}/api/business/${resolvedVerifiedId}/track`, {method: 'POST',  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },  body: JSON.stringify({ event: 'view', sessionBusinessIds: otherSessionIds })}).catch(() => {});
        } catch (e) {}
      }
    },
    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
      return url;
    },
    getPartnerLabel(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return ''
      // Destinations are public sites, not paying partners — they don't sit on
      // the verified/spotlight/signature ladder, so no badge.
      if (rec._verifiedModel === 'destination') return ''
      const tier = rec.partnerTier
      if (tier === 'featured' || tier === 'signature') return "Jinni's Signature"
      if (tier === 'spotlight') return "Jinni's Spotlight"
      return 'Jinni Verified'
    },
    getPartnerIcon(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return ''
      if (rec._verifiedModel === 'destination') return ''
      const tier = rec.partnerTier
      if (tier === 'featured' || tier === 'signature') {return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`}
      if (tier === 'spotlight') {return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/></svg>`}
      return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    getPartnerLabelClass(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return ''
      if (rec._verifiedModel === 'destination') return ''
      const tier = rec.partnerTier
      if (tier === 'featured' || tier === 'signature') return 'partner-label--signature'
      if (tier === 'spotlight') return 'partner-label--spotlight'
      return 'partner-label--verified'
    },
    getPartnerWrapperClass(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return ''
      if (rec._verifiedModel === 'destination') return ''
      const tier = rec.partnerTier
      if (tier === 'featured' || tier === 'signature') return 'card-glow--signature'
      if (tier === 'spotlight') return 'card-glow--spotlight'
      return 'card-glow--verified'
    }
  }
};
</script>







<style scoped>
/* ==================================================================================================== */
/*                                        SETTINGS MODAL - COMPLETE STYLES
/* ==================================================================================================== */
.expandable-selector{position:relative;width:100%;transition:all 0.3s ease}
.expandable-selector.expanded{z-index:100}
.selector-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;border:none;background:transparent;cursor:pointer;transition:all 0.2s ease;font-family:inherit;font-size:0.875rem}
.selector-trigger:disabled{opacity:0.5;cursor:not-allowed}
.selector-trigger svg{flex-shrink:0;transition:transform 0.2s ease}
.selector-trigger svg.rotated{transform:rotate(180deg)}
.current-selection{display:flex;align-items:center;gap:8px;flex:1;text-align:left}
.current-selection .flag{font-size:1.125rem;flex-shrink:0}
.selector-dropdown-inline{width:100%;border-radius:8px;overflow:hidden;margin-top:8px;max-height:280px;display:flex;flex-direction:column;border:1px solid}
.dropdown-search{padding:10px 12px;border:none;border-bottom:1px solid;font-size:0.875rem;font-family:inherit;outline:none;flex-shrink:0}
.dropdown-list{overflow-y:auto;max-height:240px;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
.dropdown-list::-webkit-scrollbar{display:none;width:0 !important;height:0 !important}
.dropdown-item{display:flex;align-items:center;padding:10px 12px;cursor:pointer;transition:all 0.2s ease;gap:10px}
.dropdown-item .flag{font-size:1.125rem;flex-shrink:0}
.dropdown-item .item-name{flex:1;font-size:0.875rem}
.dropdown-item .item-native{font-size:0.75rem;opacity:0.7;margin-left:8px}
.dropdown-item .checkmark{flex-shrink:0;color:#10B981}
.expand-enter-active{transition:all 0.3s cubic-bezier(0.4,0,0.2,1);overflow:hidden}
.expand-leave-active{transition:all 0.2s cubic-bezier(0.4,0,1,1);overflow:hidden}
.expand-enter-from,.expand-leave-to{max-height:0;opacity:0;margin-top:0}
.expand-enter-to{max-height:300px;opacity:1;margin-top:8px}

.settings-content.night .dropdown-item{color:#A0AEC0}
.settings-content.night .dropdown-item:hover{background:rgba(255,255,255,0.06)}
.settings-content.night .dropdown-item.selected{background:rgba(255,255,255,0.1)}
.settings-content.day .dropdown-item{color:#3c2a1e}
.settings-content.day .dropdown-item:hover{background:rgba(0,0,0,0.04)}
.settings-content.day .dropdown-item.selected{background:rgba(0,0,0,0.07)}
/* Settings Modal */
.settings-modal{position:fixed;inset:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;animation:fadeIn 0.2s ease;overflow:hidden}
.settings-content{max-width:600px;width:100%;max-height:85vh;display:flex;flex-direction:column;border-radius:16px;animation:slideUp 0.3s ease;overflow:hidden;position:relative}
.settings-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:60px 24px 24px 24px;-webkit-overflow-scrolling:touch;-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 20px),rgba(0,0,0,0.4) calc(100% - 8px),transparent 100%);mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 20px),rgba(0,0,0,0.4) calc(100% - 8px),transparent 100%)}
.reset-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;background:transparent;border:transparent;border-radius:25px;font-size:0.875rem;font-weight:500;cursor:pointer;margin:0 auto}
.settings-section{margin-bottom:24px;padding-bottom:24px;position:relative;border-bottom:none}
.settings-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.settings-section h4{margin:0 0 18px 0;font-size:1.125rem;font-weight:600;letter-spacing:-0.02em}
.settings-description{font-size:0.8125rem;opacity:0.9;margin:12px 0;line-height:1.6}
.setting-item{margin-bottom:24px}
.setting-item:last-child{margin-bottom:0}
.setting-item>label{display:flex;justify-content:space-between;align-items:center;font-size:0.875rem;font-weight:500;margin-bottom:10px;gap:12px}
.setting-value{font-size:0.8125rem;opacity:0.8;font-weight:600;letter-spacing:0.02em}
.slider-container{width:100%;padding:4px 0}
.setting-slider{width:100%;height:7px;border-radius:4px;background:rgba(128,128,128,0.15);outline:none;-webkit-appearance:none;appearance:none;cursor:pointer;transition:background 0.2s ease}
.setting-slider:hover{background:rgba(128,128,128,0.2)}
.setting-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#D4AF37;cursor:pointer;transition:all 0.2s ease;box-shadow:0 0 4px rgba(0,0,0,0.2)}
.setting-slider::-webkit-slider-thumb:hover{transform:scale(1.15);box-shadow:0 0 0 4px rgba(212,175,55,0.15),0 2px 6px rgba(0,0,0,0.3)}
.setting-slider::-webkit-slider-thumb:active{transform:scale(1.05)}
.setting-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#D4AF37;cursor:pointer;border:none;transition:all 0.2s ease;box-shadow:0 0 4px rgba(0,0,0,0.2)}
.setting-slider::-moz-range-thumb:hover{transform:scale(1.15);box-shadow:0 0 0 4px rgba(212,175,55,0.15),0 2px 6px rgba(0,0,0,0.3)}
.setting-slider::-moz-range-thumb:active{transform:scale(1.05)}
.slider-labels{display:flex;justify-content:space-between;margin-top:10px;font-size:0.6875rem;opacity:0.7;font-weight:500}
.setting-toggle{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:16px;border-radius:10px;background:rgba(128,128,128,0.05);transition:background 0.2s ease}
.setting-toggle:hover{background:rgba(128,128,128,0.08)}
.toggle-label{flex:1}
.toggle-label>span{display:block;font-size:0.875rem;font-weight:500;margin-bottom:5px}
.setting-help{font-size:0.75rem;opacity:0.8;margin:0;line-height:1.5}
.toggle-switch{position:relative;display:inline-block;width:52px;height:28px;flex-shrink:0}
.toggle-switch input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:rgba(128,128,128,0.25);transition:0.3s ease;border-radius:28px}
.toggle-slider:before{position:absolute;content:"";height:22px;width:22px;left:3px;bottom:3px;background-color:white;transition:0.3s ease;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.2)}
input:checked+.toggle-slider{background-color:#D4AF37}
input:checked+.toggle-slider:before{transform:translateX(24px)}
input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(212,175,55,0.15)}
.settings-saved-indicator{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:12px 20px;background:rgba(76,175,80,0.95);box-shadow:0 0 20px rgba(76,175,80,0.4);border-radius:50px;color:white;font-size:0.875rem;font-weight:500;animation:slideInUp 0.3s ease,fadeOut 0.3s ease 1.7s forwards;z-index:10001}
.settings-saved-indicator svg{flex-shrink:0}
@keyframes slideInUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes fadeOut{to{opacity:0;transform:translate(-50%,-10px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.theme-buttons{display:flex;gap:8px;margin-top:6px}
.theme-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 12px;border:none;border-radius:10px;font-size:0.8125rem;font-weight:500;cursor:pointer;transition:all 0.2s ease;background:transparent;color:inherit;font-family:inherit}
.theme-btn svg{flex-shrink:0;width:16px;height:16px}
.gps-active-placeholder{display:flex;align-items:center;gap:15px;padding:20px;border-radius:10px;margin-top:10px}

/* Settings panel shell — the glass vars below drive every surface's edge */
.settings-content.night{background:rgba(40,30,62,0.62);color:#e2e8f0;backdrop-filter:blur(30px) saturate(190%);-webkit-backdrop-filter:blur(30px) saturate(190%);box-shadow:inset 0 0 0 1px rgba(167,139,250,0.12),0 0 40px rgba(0,0,0,0.4);--glass-fill:linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0));--glass-sheen:inset 0 0 1px rgba(255,255,255,0.1),inset 0 0 0 1px rgba(255,255,255,0.04),0 0 2px rgba(0,0,0,0.2)}
.settings-content.night .settings-section h4{color:#c084fc}
.settings-content.night .settings-description{color:#94a3b8}
.settings-content.night .setting-slider{background:rgba(255,255,255,0.1)}
.settings-content.night .setting-slider:hover{background:rgba(255,255,255,0.16)}
.settings-content.night .setting-slider::-webkit-slider-thumb{background:#c084fc}
.settings-content.night .setting-slider::-webkit-slider-thumb:hover{box-shadow:0 0 0 4px rgba(192,132,252,0.15),0 2px 6px rgba(192,132,252,0.4)}
.settings-content.night .setting-slider::-moz-range-thumb{background:#c084fc}
.settings-content.night .setting-slider::-moz-range-thumb:hover{box-shadow:0 0 0 4px rgba(192,132,252,0.15),0 2px 6px rgba(192,132,252,0.4)}
.settings-content.night .toggle-slider{background-color:rgba(255,255,255,0.18)}
.settings-content.night input:checked+.toggle-slider{background-color:#c084fc}
.settings-content.night input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(192,132,252,0.15)}
.settings-content.night .setting-item>label,.settings-content.night .toggle-label>span{color:#A0AEC0}
.settings-content.night .setting-value,.settings-content.night .setting-help,.settings-content.night .slider-labels{color:#94a3b8}

.settings-content.day{background:rgba(255,251,245,0.74);color:#3c2a1e;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);border:none;box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.45);--glass-fill:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.05));--glass-sheen:inset 0 0 1px rgba(255,255,255,0.95),inset 0 0 0 1px rgba(255,255,255,0.22),0 0 3px rgba(120,80,30,0.07)}
.settings-content.day .settings-section h4{color:#A0522D}
.settings-content.day .settings-description{color:rgba(92,74,66,0.7)}
.settings-content.day .setting-slider{background:rgba(0,0,0,0.08)}
.settings-content.day .setting-slider:hover{background:rgba(0,0,0,0.12)}
.settings-content.day .setting-slider::-webkit-slider-thumb{background:#A0522D}
.settings-content.day .setting-slider::-webkit-slider-thumb:hover{box-shadow:0 0 0 4px rgba(160,82,45,0.15),0 0 6px rgba(160,82,45,0.4)}
.settings-content.day .setting-slider::-moz-range-thumb{background:#A0522D}
.settings-content.day .setting-slider::-moz-range-thumb:hover{box-shadow:0 0 0 4px rgba(160,82,45,0.15),0 0 6px rgba(160,82,45,0.4)}
.settings-content.day .toggle-slider{background-color:rgba(0,0,0,0.15)}
.settings-content.day input:checked+.toggle-slider{background-color:#A0522D}
.settings-content.day input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(160,82,45,0.15)}
.settings-content.day .setting-item>label,.settings-content.day .toggle-label>span{color:#3c2a1e}
.settings-content.day .setting-value,.settings-content.day .setting-help,.settings-content.day .slider-labels{color:rgba(92,74,66,0.7)}

.danger-zone h4{color:#ef4444;font-size:1.125rem;font-weight:600}
.danger-item{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:10px 0}
.danger-item-info{flex:1}
.danger-item-info label{display:block;font-weight:500;font-size:0.9375rem;margin-bottom:5px;color:#A0AEC0}
.danger-description{display:block;font-size:0.8125rem;opacity:0.7;line-height:1.5}
.danger-link{color:#ef4444;text-decoration:underline;text-decoration-color:rgba(239,68,68,0.5);text-underline-offset:3px;cursor:pointer;transition:all 0.2s ease}
.danger-link:hover{color:#dc2626;text-decoration-color:#dc2626;text-shadow:0 0 6px rgba(239,68,68,0.3)}
.delete-account-link:hover{text-shadow:0 0 6px rgba(220,38,38,0.4)}
.danger-confirm-box{background:rgba(239,68,68,0.08);border-radius:10px;padding:16px 18px;margin:4px 0 14px;animation:dangerFadeIn 0.2s ease}
.danger-confirm-box p{font-size:0.875rem;color:#A0AEC0;margin:0 0 12px;line-height:1.5}
.danger-confirm-box strong{color:#ef4444}
.danger-confirm-actions{display:flex;gap:10px}
.danger-btn-yes,.danger-btn-no{border:none;border-radius:6px;padding:7px 16px;font-size:0.8125rem;font-weight:500;cursor:pointer;transition:background 0.2s,opacity 0.2s}
.danger-btn-yes{background:#ef4444;color:#fff;opacity:0.8}
.danger-btn-yes:hover{background:#dc2626;opacity:0.9}
.danger-btn-yes:disabled{opacity:0.35;cursor:not-allowed}
.danger-btn-no{background:rgba(255,255,255,0.08);color:#94a3b8}
.danger-btn-no:hover{background:rgba(255,255,255,0.14)}
.danger-type-input{width:100%;padding:8px 12px;border-radius:6px;border:none;background:rgba(0,0,0,0.25);color:#ef4444;font-size:0.875rem;font-weight:600;letter-spacing:2px;outline:none;margin-bottom:12px;box-sizing:border-box}
.danger-type-input::placeholder{color:rgba(239,68,68,0.35)}
.danger-link--active{opacity:0.4;pointer-events:none;text-shadow:none}
@keyframes dangerFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
/* ── Settings danger zone — day text colours ─────────────────────────── */
.settings-content.day .danger-zone h4{color:#A0522D}
.settings-content.day .danger-item-info label{color:#3c2a1e}
.settings-content.day .danger-description{color:rgba(92,74,66,0.75)}
.settings-content.day .danger-confirm-box p{color:#3c2a1e}
.settings-content.day .danger-confirm-box strong{color:#b91c1c}

/* ── Settings modal — glacier glass ──────────────────────────────────── */
/* Transparent floating header (matches the saved-panel heading): the body
   scrolls underneath and dissolves into the body's mask fade. */
.settings-content .modal-header{position:absolute;top:0;left:0;right:0;z-index:4;background:transparent;pointer-events:none;padding:14px 16px 10px 24px}
.settings-content .modal-header::before{content:"";position:absolute;inset:0;z-index:-1;-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);-webkit-mask-image:linear-gradient(to bottom,#000 52%,transparent 100%);mask-image:linear-gradient(to bottom,#000 52%,transparent 100%)}
.settings-content.night .modal-header::before{background:rgba(40,30,62,0.55)}
.settings-content.day .modal-header::before{background:rgba(255,251,245,0.6)}
.settings-content .modal-header h3,.settings-content .modal-header .close-btn{pointer-events:auto}
/* Layout for the glass buttons */
.settings-content .close-btn{width:34px;height:34px;border-radius:10px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.18s ease,transform 0.15s ease}
.settings-content .close-btn svg{width:18px;height:18px}
.settings-content .close-btn:active{transform:scale(0.9)}
.settings-content .reset-btn{font-weight:600;transition:background 0.18s ease,transform 0.15s ease}
.settings-content .reset-btn:active{transform:scale(0.97)}
.settings-content .danger-btn-yes,.settings-content .danger-btn-no{border-radius:10px;padding:8px 18px;font-weight:600;transition:all 0.18s ease}
.settings-content .danger-type-input{border-radius:10px}
.settings-content .selector-dropdown-inline,.settings-content .gps-active-placeholder{border:none}
/* One shared frosted blur for every glass surface */
.settings-content .close-btn,.settings-content .selector-trigger,.settings-content .selector-dropdown-inline,.settings-content .dropdown-search,.settings-content .theme-btn,.settings-content .setting-toggle,.settings-content .reset-btn,.settings-content .danger-btn-yes,.settings-content .danger-btn-no,.settings-content .danger-confirm-box,.settings-content .gps-active-placeholder,.settings-content .danger-type-input{backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%)}
/* One shared liquid-glass edge: gradient fill + bright top sheen, themed via vars */
.settings-content .close-btn,.settings-content .selector-trigger,.settings-content .theme-btn:not(.active),.settings-content .setting-toggle,.settings-content .reset-btn,.settings-content .danger-btn-no,.settings-content .gps-active-placeholder{background-image:var(--glass-fill);box-shadow:var(--glass-sheen)}

/* NIGHT — surface fills & text */
.settings-content.night .close-btn{background:rgba(255,255,255,0.08);color:#cbd5e1}
.settings-content.night .close-btn:hover{background:rgba(255,255,255,0.18)}
.settings-content.night .selector-trigger{background:rgba(255,255,255,0.06);color:#cdd5e2}
.settings-content.night .selector-trigger:hover:not(:disabled){background:rgba(255,255,255,0.12)}
.settings-content.night .selector-dropdown-inline{background:rgba(46,38,66,0.72);background-image:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0));box-shadow:inset 0 0 1px rgba(255,255,255,0.14),inset 0 0 0 1px rgba(255,255,255,0.05),0 8px 26px rgba(0,0,0,0.5)}
.settings-content.night .dropdown-search{background:rgba(255,255,255,0.05);color:#cdd5e2;border-bottom-color:rgba(255,255,255,0.1)}
.settings-content.night .theme-btn{background:rgba(255,255,255,0.06);color:rgba(226,232,240,0.8)}
.settings-content.night .theme-btn:hover{background:rgba(255,255,255,0.12)}
.settings-content.night .theme-btn.active{background:rgba(255,255,255,0.16);color:#d8b4fe;box-shadow:0 1px 4px rgba(0,0,0,0.28)}
.settings-content.night .day-btn.active{background:rgba(255,255,255,0.16);color:#fcd34d;box-shadow:0 1px 4px rgba(0,0,0,0.28)}
.settings-content.night .night-btn.active{background:rgba(255,255,255,0.16);color:#d8b4fe;box-shadow:0 1px 4px rgba(0,0,0,0.28)}
.settings-content.night .system-btn.active{background:rgba(255,255,255,0.16);color:#d8b4fe;box-shadow:0 1px 4px rgba(0,0,0,0.28)}
.settings-content.night .setting-toggle{background:rgba(255,255,255,0.05)}
.settings-content.night .reset-btn{background:rgba(255,255,255,0.06);color:#d8b4fe}
.settings-content.night .reset-btn:hover{background:rgba(255,255,255,0.12)}
.settings-content.night .gps-active-placeholder{background:rgba(255,255,255,0.05)}
.settings-content.night .danger-btn-yes{background:rgba(239,68,68,0.82);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2)}
.settings-content.night .danger-btn-yes:hover{background:rgba(220,38,38,0.95)}
.settings-content.night .danger-btn-no{background:rgba(255,255,255,0.07);color:#cbd5e1}
.settings-content.night .danger-btn-no:hover{background:rgba(255,255,255,0.14)}
.settings-content.night .danger-confirm-box{background-image:linear-gradient(180deg,rgba(239,68,68,0.05),rgba(239,68,68,0))}
.settings-content.night .danger-type-input{background:rgba(255,255,255,0.06)}

/* DAY — surface fills & text */
.settings-content.day .close-btn{background:rgba(255,255,255,0.6);color:#8b6b3d}
.settings-content.day .close-btn:hover{background:rgba(255,255,255,0.9)}
.settings-content.day .selector-trigger{background:rgba(255,255,255,0.55);color:#3c2a1e}
.settings-content.day .selector-trigger:hover:not(:disabled){background:rgba(255,255,255,0.82)}
.settings-content.day .selector-dropdown-inline{background:rgba(255,255,255,0.72);background-image:linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0.04));box-shadow:inset 0 0 1px rgba(255,255,255,0.95),inset 0 0 0 1px rgba(255,255,255,0.28),0 0 10px rgba(120,80,30,0.16)}
.settings-content.day .dropdown-search{background:rgba(255,255,255,0.5);color:#3c2a1e;border-bottom-color:rgba(120,80,30,0.15)}
.settings-content.day .theme-btn{background:rgba(255,255,255,0.5);color:rgba(92,74,66,0.85)}
.settings-content.day .theme-btn:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .theme-btn.active{background:rgba(255,255,255,0.92);color:#8a5a1e;box-shadow:0 1px 4px rgba(120,80,30,0.16)}
.settings-content.day .day-btn.active{background:rgba(255,255,255,0.92);color:#8a5a1e;box-shadow:0 1px 4px rgba(120,80,30,0.16)}
.settings-content.day .night-btn.active{background:rgba(255,255,255,0.92);color:#374151;box-shadow:0 1px 4px rgba(120,80,30,0.16)}
.settings-content.day .system-btn.active{background:rgba(255,255,255,0.92);color:#8a5a1e;box-shadow:0 1px 4px rgba(120,80,30,0.16)}
.settings-content.day .setting-toggle{background:rgba(255,255,255,0.45)}
.settings-content.day .reset-btn{background:rgba(255,255,255,0.5);color:#8a5a1e}
.settings-content.day .reset-btn:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .gps-active-placeholder{background:rgba(255,255,255,0.45)}
.settings-content.day .danger-btn-yes{background:rgba(220,38,38,0.88);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28)}
.settings-content.day .danger-btn-yes:hover{background:rgba(185,28,28,0.95)}
.settings-content.day .danger-btn-no{background:rgba(255,255,255,0.5);color:#6b5840}
.settings-content.day .danger-btn-no:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .danger-confirm-box{background:rgba(239,68,68,0.06);background-image:linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0))}
.settings-content.day .danger-type-input{background:rgba(255,255,255,0.75);color:#b91c1c}
.settings-content.day .danger-type-input::placeholder{color:rgba(185,28,28,0.35)}

/* Soft, center-bright section dividers (a light streak, not a hard line) */
.settings-section:not(:last-child)::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;pointer-events:none;background:linear-gradient(to right,transparent,rgba(128,128,128,0.2),transparent)}
.settings-content.night .settings-section:not(:last-child)::after{background:linear-gradient(to right,transparent,rgba(255,255,255,0.11),transparent)}
.settings-content.day .settings-section:not(:last-child)::after{background:linear-gradient(to right,transparent,rgba(0,0,0,0.1),transparent)}
/* Saved indicator → frosted green glass */
.settings-saved-indicator{background:rgba(34,197,94,0.82);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.25),0 10px 30px rgba(0,0,0,0.3)}
@media (max-width:768px){.theme-buttons{gap:6px}.theme-btn{padding:10px;font-size:0.875rem}.theme-btn svg{width:18px;height:18px}.settings-modal{padding:0}.settings-body{padding:58px 16px 20px 16px}.settings-section{margin-bottom:28px;padding-bottom:20px}.settings-section h4{font-size:1rem}.setting-toggle{padding:14px}.settings-saved-indicator{bottom:16px;left:16px;right:16px;transform:none;width:calc(100% - 32px);justify-content:center}.gps-active-placeholder{gap:10px;padding:20px 10px}}


/* ========================================== */
/* SESSION WARNING - COMPACT CSS */
/* ========================================== */
.session-warning-banner{display:flex;align-items:center;gap:16px;padding:10px 12px;margin:20px 0;border-radius:16px;backdrop-filter:blur(5px) saturate(180%);-webkit-backdrop-filter:blur(5px) saturate(180%);transition:opacity 0.6s ease,transform 0.6s ease}
.warning-icon{flex-shrink:0;width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:50%;backdrop-filter:blur(1px) saturate(180%);-webkit-backdrop-filter:blur(1px) saturate(180%)}
.warning-content{flex:1;min-width:0}
.warning-title{font-weight:700;font-size:1rem;margin-bottom:6px}
.warning-message{font-size:0.75rem;line-height:1.5;opacity:0.95}
.warning-actions{display:flex;gap:10px;flex-shrink:0}
.warning-btn{padding:10px 20px;border-radius:25px;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;white-space:nowrap;display:flex;align-items:center;gap:6px;backdrop-filter:blur(1px) saturate(180%);-webkit-backdrop-filter:blur(1px) saturate(180%)}
.warning-btn svg{flex-shrink:0}
.slide-down-enter-active,.slide-down-leave-active{transition:all 0.9s ease}
.slide-down-enter-from{opacity:0;transform:translateY(-20px)}
.slide-down-leave-to{opacity:0;transform:translateY(-10px)}
.session-limit-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px}
.session-limit-modal{border-radius:16px;max-width:420px;width:100%;overflow:hidden}
.session-limit-modal .modal-header{padding:20px;justify-content:center;gap:20px}
.modal-icon.warning{width:80px;height:80px;display:flex;align-items:center;justify-content:center;border-radius:50%;backdrop-filter:blur(1px) saturate(180%);-webkit-backdrop-filter:blur(1px) saturate(180%)}
.modal-icon.warning svg{stroke:white;fill:none}
.session-limit-modal h3{margin:0;font-size:1.25rem;font-weight:600}
.session-limit-modal .modal-body{padding:0 24px}
.limit-explanation{font-size:0.9375rem;margin-bottom:16px}
.limit-reason{font-size:0.875rem;font-weight:500;margin-bottom:8px}
.limit-reasons{list-style:none;padding:0;margin:0 0 16px 0}
.limit-reasons li{padding:8px 12px 8px 36px;position:relative;font-size:0.875rem;border-left:3px solid;margin-bottom:6px;border-radius:4px}
.limit-reasons li::before{content:"•";position:absolute;left:16px;font-weight:bold}
.limit-suggestion{font-size:0.875rem;font-style:italic}
.session-limit-modal .modal-actions{padding:12px 24px;display:flex;flex-direction:column;gap:12px}
.btn-primary.large{padding:14px 24px;font-size:0.9375rem;font-weight:600;border-radius:25px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;backdrop-filter:blur(1px) saturate(180%);-webkit-backdrop-filter:blur(1px) saturate(180%)}
.btn-secondary{padding:12px 24px;font-size:0.875rem;border-radius:25px;background:transparent;cursor:pointer;transition:all 0.2s}
.session-limit-modal .btn-secondary{border:none;backdrop-filter:blur(1px) saturate(180%);-webkit-backdrop-filter:blur(1px) saturate(180%);background-image:var(--glass-fill);box-shadow:var(--glass-sheen)}
.slide-down-enter-active,.slide-down-leave-active{transition:all 0.3s ease}
.slide-down-enter-from{opacity:0;transform:translateY(-20px)}
.slide-down-leave-to{opacity:0;transform:translateY(-10px)}
@media (max-width:768px){.session-warning-banner{flex-direction:column;align-items:stretch;gap:12px;padding:14px 16px}.warning-icon{align-self:flex-start}.warning-actions{flex-direction:column}.warning-btn{width:100%;text-align:center}}
.genie-chat-container.day-mode .session-warning-banner{background:rgba(255,251,245,0.74)}
.genie-chat-container.day-mode .warning-icon{background:linear-gradient(135deg,rgba(212,175,55,0.85),rgba(255,140,0,0.85));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3)}
.genie-chat-container.day-mode .warning-title{color:#B7791F;font-weight:700}
.genie-chat-container.day-mode .warning-message{color:#424242;font-weight:500}
.genie-chat-container.day-mode .warning-btn.primary{background:linear-gradient(135deg,rgba(212,175,55,0.82) 0%,rgba(255,140,0,0.82) 100%);color:white;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.35)}
.genie-chat-container.day-mode .warning-btn.primary:hover{background:linear-gradient(135deg,rgba(199,158,46,0.95) 0%,rgba(230,125,0,0.95) 100%)}
.genie-chat-container.day-mode .warning-btn.dismiss{background:rgba(255,255,255,0.5);color:#8b6b3d;border:none;font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .warning-btn.dismiss:hover{background:rgba(255,255,255,0.75);color:#B7791F;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.session-limit-modal.day-mode{background:rgba(255,251,245,0.74);color:#3c2a1e;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.45);--glass-fill:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.05));--glass-sheen:inset 0 0 1px rgba(255,255,255,0.95),inset 0 0 0 1px rgba(255,255,255,0.22),0 0 3px rgba(120,80,30,0.07)}
.session-limit-modal.day-mode .modal-icon.warning{background:linear-gradient(135deg,rgba(212,175,55,0.85),rgba(255,140,0,0.85));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3)}
.session-limit-modal.day-mode h3{color:#B7791F;font-weight:700}
.session-limit-modal.day-mode .limit-explanation{color:#424242;font-weight:500}
.session-limit-modal.day-mode .limit-explanation strong{color:#B7791F}
.session-limit-modal.day-mode .limit-reason{color:#B7791F;font-weight:600}
.session-limit-modal.day-mode .limit-reasons{list-style:none;padding:0;margin:0 0 16px 0}
.session-limit-modal.day-mode .limit-reasons li{color:#5d4037;border-left:3px solid #D4AF37;background:linear-gradient(90deg,rgba(212,175,55,0.12),rgba(212,175,55,0.03));border-radius:6px;padding:10px 12px 10px 36px;position:relative;margin-bottom:8px}
.session-limit-modal.day-mode .limit-reasons li::before{color:#D4AF37}
.session-limit-modal.day-mode .limit-suggestion{color:#5d4037;font-weight:500;opacity:0.9}
.session-limit-modal.day-mode .btn-primary.large{background:linear-gradient(135deg,rgba(212,175,55,0.82) 0%,rgba(255,140,0,0.82) 100%);color:white;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.35)}
.session-limit-modal.day-mode .btn-primary.large:hover{background:linear-gradient(135deg,rgba(199,158,46,0.95) 0%,rgba(230,125,0,0.95) 100%)}
.session-limit-modal.day-mode .btn-secondary{color:#6b5840;font-weight:600;background-color:rgba(255,255,255,0.5)}
.session-limit-modal.day-mode .btn-secondary:hover{background-color:rgba(255,255,255,0.78);color:#B7791F}
.genie-chat-container.night-mode .session-warning-banner{background:rgba(255,255,255,0.06);backdrop-filter:blur(2px) saturate(180%);-webkit-backdrop-filter:blur(2px) saturate(180%);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .warning-icon{background:linear-gradient(135deg,rgba(139,92,246,0.82),rgba(168,85,247,0.82));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.genie-chat-container.night-mode .warning-title{color:#c084fc;font-weight:700}
.genie-chat-container.night-mode .warning-message{color:#e2e8f0;font-weight:500}
.genie-chat-container.night-mode .warning-btn.primary{background:linear-gradient(135deg,rgba(139,92,246,0.7) 0%,rgba(168,85,247,0.7) 100%);color:white;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.genie-chat-container.night-mode .warning-btn.primary:hover{background:linear-gradient(135deg,rgba(124,58,237,0.75) 0%,rgba(147,51,234,0.75) 100%)}
.genie-chat-container.night-mode .warning-btn.dismiss{background:rgba(255,255,255,0.07);color:#cbd5e1;border:none;font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14)}
.genie-chat-container.night-mode .warning-btn.dismiss:hover{background:rgba(255,255,255,0.16)}
.session-limit-modal.night-mode{background:rgba(40,30,62,0.62);color:#e2e8f0;backdrop-filter:blur(30px) saturate(190%);-webkit-backdrop-filter:blur(30px) saturate(190%);box-shadow:inset 0 0 0 1px rgba(167,139,250,0.12),0 0 40px rgba(0,0,0,0.4);--glass-fill:linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0));--glass-sheen:inset 0 0 1px rgba(255,255,255,0.1),inset 0 0 0 1px rgba(255,255,255,0.04),0 0 2px rgba(0,0,0,0.2)}
.session-limit-modal.night-mode .modal-icon.warning{background:linear-gradient(135deg,rgba(139,92,246,0.7),rgba(168,85,247,0.7));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.session-limit-modal.night-mode h3{color:#a855f7;font-weight:700;background:linear-gradient(135deg,#8b5cf6,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.session-limit-modal.night-mode .limit-explanation{color:#e2e8f0;font-weight:500}
.session-limit-modal.night-mode .limit-explanation strong{color:#c084fc}
.session-limit-modal.night-mode .limit-reason{color:#c084fc;font-weight:600}
.session-limit-modal.night-mode .limit-reasons{list-style:none;padding:0;margin:0 0 16px 0}
.session-limit-modal.night-mode .limit-reasons li{color:#cbd5e0;border-left:3px solid #c084fc;background:linear-gradient(90deg,rgba(192,132,252,0.15),rgba(192,132,252,0.05));border-radius:6px;padding:10px 12px 10px 36px;position:relative;margin-bottom:8px}
.session-limit-modal.night-mode .limit-reasons li::before{color:#c084fc}
.session-limit-modal.night-mode .limit-suggestion{color:#e2e8f0;font-weight:500;opacity:0.9}
.session-limit-modal.night-mode .btn-primary.large{background:linear-gradient(135deg,rgba(139,92,246,0.7) 0%,rgba(168,85,247,0.7) 100%);color:white;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.session-limit-modal.night-mode .btn-primary.large:hover{background:linear-gradient(135deg,rgba(124,58,237,0.75) 0%,rgba(147,51,234,0.75) 100%)}
.session-limit-modal.night-mode .btn-secondary{color:#cbd5e1;font-weight:600;background-color:rgba(255,255,255,0.07)}
.session-limit-modal.night-mode .btn-secondary:hover{background-color:rgba(255,255,255,0.14)}


/* Other CSS */
.genie-chat-container ::-webkit-scrollbar{width:6px !important;height:4px !important}
.genie-chat-container ::-webkit-scrollbar-track{background:transparent}
.genie-chat-container ::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(128,128,128,0.5)}
.genie-chat-container ::-webkit-scrollbar-thumb:hover{background:rgba(128,128,128,0.8)}
.genie-chat-container.night-mode ::-webkit-scrollbar-thumb{background:rgba(192,132,252,0.1)}
.genie-chat-container.night-mode ::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.genie-chat-container.day-mode ::-webkit-scrollbar-thumb{background:rgba(160,82,45,0.3)}
.genie-chat-container.day-mode ::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}
.settings-content.night .settings-body::-webkit-scrollbar{width:4px;height:8px}
.settings-content.night .settings-body::-webkit-scrollbar-track{background:transparent}
.settings-content.night .settings-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(192,132,252,0.1)}
.settings-content.night .settings-body::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.settings-content.day .settings-body::-webkit-scrollbar{width:4px;height:8px}
.settings-content.day .settings-body::-webkit-scrollbar-track{background:transparent}
.settings-content.day .settings-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(160,82,45,0.3)}
.settings-content.day .settings-body::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}

/* Info modal scrollbar */
.info-modal.night .modal-body::-webkit-scrollbar{width:4px}
.info-modal.night .modal-body::-webkit-scrollbar-track{background:transparent}
.info-modal.night .modal-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(192,132,252,0.1)}
.info-modal.night .modal-body::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.info-modal.day .modal-body::-webkit-scrollbar{width:8px}
.info-modal.day .modal-body::-webkit-scrollbar-track{background:transparent}
.info-modal.day .modal-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(160,82,45,0.3)}
.info-modal.day .modal-body::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}

/* Saved panel scrollbar */
.saved-panel.night .saved-panel-body::-webkit-scrollbar{width:4px}
.saved-panel.night .saved-panel-body::-webkit-scrollbar-track{background:transparent}
.saved-panel.night .saved-panel-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(192,132,252,0.1)}
.saved-panel.night .saved-panel-body::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.saved-panel.day .saved-panel-body::-webkit-scrollbar{width:4px}
.saved-panel.day .saved-panel-body::-webkit-scrollbar-track{background:transparent}
.saved-panel.day .saved-panel-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(160,82,45,0.3)}
.saved-panel.day .saved-panel-body::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}

.genie-chat-container{display:flex;height:100vh;color:#fff;top:0;left:0;right:0;bottom:0;overflow:hidden;min-height:0;-webkit-text-size-adjust:100%;text-size-adjust:100%}
/* iOS keyboard gap filler — bottom tones of the chat gradients. */
.kb-strip{position:fixed;left:0;right:0;bottom:0;pointer-events:none;z-index:99}
.genie-chat-container.night-mode .kb-strip{background:#16213e}
.genie-chat-container.day-mode .kb-strip{background:#efe4cf}
.sidebar-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99;display:block}
.sidebar{width:280px;display:flex;flex-direction:column;z-index:10;transition:width 0.3s ease,transform 0.3s ease}
.sidebar-collapsed{width:60px;transition:width 0.3s ease,transform 0.3s ease}
.sidebar-collapsed .app-header{padding:15px 10px;align-items:center}
.sidebar-collapsed .sidebar-header{flex-direction:column;gap:14px;padding:0 0 14px 0;align-items:center;justify-content:center}
.sidebar-collapsed .chat-history{display:none}
.app-header{padding:15px 15px 0 15px}
.app-name{font-size:1.6rem;font-weight:600;color:#FFD700;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.app-brand{display:flex;align-items:center;gap:8px;justify-content:flex-start}
.app-icon{width:3.75rem;height:3.75rem;object-fit:contain}
.app-icon-collapsed{width:3.4375rem;height:3.4375rem;object-fit:contain}
.collapse-btn{background:transparent;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.collapse-btn-inline{background:transparent;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-inline-start:auto;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.app-brand-collapsed{display:flex;justify-content:center;align-items:center}
.collapse-btn svg,.collapse-btn-inline svg{width:20px;height:20px}
.new-chat-btn svg,.new-chat-btn-collapsed svg,.saved-places-nav-btn svg{width:20px;height:20px}
.sidebar-header{padding:10px 16px 3px 16px;display:flex;justify-content:space-between;align-items:center}
.new-chat-btn{background:transparent;color:inherit;border:none;height:38px;font-size:0.9rem;line-height:1;padding:0 15px;border-radius:25px;cursor:pointer;display:flex;align-items:center;gap:6px;font-weight:500;transition:all 0.3s ease;backdrop-filter:blur(1px) saturate(160%);-webkit-backdrop-filter:blur(1px) saturate(160%)}
.new-chat-btn:hover{background:transparent}
.new-chat-btn-collapsed:hover{background:transparent}
.new-chat-btn-collapsed{background:transparent;color:inherit;border:none;padding:8px;border-radius:50%;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;backdrop-filter:blur(1px) saturate(160%);-webkit-backdrop-filter:blur(1px) saturate(160%)}
.chat-history{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px 10px 10px 10px;scrollbar-width:none;-ms-overflow-style:none;-webkit-mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%)}
.loading-sessions{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px;margin:0}
.chat-history::-webkit-scrollbar{display:none;width:0;height:0}
.session-item{position:relative;padding:10px 12px;margin-bottom:8px;border-radius:8px;cursor:pointer;transition:background 0.2s ease,box-shadow 0.2s ease,color 0.2s ease}
.session-header{display:flex;justify-content:space-between;align-items:center;width:100%}
.session-title{font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;padding-bottom:10px;min-width:0;flex:1}
.title-input{background:rgba(255,255,255,0.12);border:none;color:inherit;border-radius:6px;padding:2px 5px;width:100%;backdrop-filter:blur(8px) saturate(160%);-webkit-backdrop-filter:blur(8px) saturate(160%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.genie-chat-container.night-mode .title-input{color:#e2e8f0}
.genie-chat-container.day-mode .title-input{background:rgba(255,255,255,0.55);color:#3c2a1e}
.title-input:focus{outline:none}
.session-actions{display:flex;gap:5px;opacity:0.8;transition:opacity 0.2s ease;z-index:1}
.session-item:hover .session-actions{opacity:1}
.session-actions:has(.session-actions-inline){opacity:1}
.icon-btn{background:transparent;border:none;cursor:pointer;font-size:0.8rem;padding:2px;transition:color 0.2s ease}
.icon-btn svg{display:block}
.session-actions-inline{display:flex;align-items:center;gap:3px}
.session-act-btn{background:transparent;border:none;cursor:pointer;width:28px;height:28px;border-radius:7px;padding:0;display:inline-flex;align-items:center;justify-content:center;backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%);transition:background 0.15s ease,color 0.15s ease,transform 0.12s ease}
.session-act-btn svg{display:block}
.session-act-btn:active{transform:scale(0.9)}
.session-date{position:absolute;bottom:8px;left:15px;font-size:0.7rem;margin-top:2px}
.context-menu{position:fixed;border-radius:8px;padding:8px 0;z-index:10001;min-width:150px;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.context-menu button{display:block;width:100%;padding:8px 15px;text-align:left;background:transparent;border:none;cursor:pointer;font-size:0.9rem;transition:all 0.2s ease}
/* Teleported to <body>, so the menu is outside .genie-chat-container — theme it via its own class */
.context-menu.night-mode{background:rgba(30,20,56,0.72)}
.context-menu.night-mode button{color:#fff}
.context-menu.night-mode button:hover{background:rgba(255,255,255,0.1)}
.context-menu.night-mode button.delete-btn{color:#ff6b6b}
.context-menu.day-mode{background:rgba(255,255,255,0.72);box-shadow:0 0 1px rgba(0,0,0,0.14),inset 0 0 0 1px rgba(255,255,255,0.6)}
.context-menu.day-mode button{color:#3c2a1e}
.context-menu.day-mode button:hover{background:rgba(212,175,55,0.1)}
.context-menu.day-mode button.delete-btn{color:#e53e3e}
.switch-mode-wrapper{padding:5px 15px 0 15px;flex-shrink:0}
.switch-mode-btn{width:100%;display:flex;align-items:center;gap:10px;padding:4px 8px;border-radius:25px;box-sizing:border-box;min-height:44px;border:none;cursor:pointer;font-family:inherit;font-size:1rem;font-weight:500;transition:all 0.2s ease;text-align:left;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.switch-mode-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.switch-mode-label{font-size:1rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.switch-arrow{margin-left:auto;flex-shrink:0;transition:transform 0.2s ease}
.sidebar-footer{position:relative;padding:15px;display:flex;align-items:center;justify-content:center}
.sidebar-collapsed .sidebar-footer{padding:0}
.sidebar-collapsed .new-chat-btn-collapsed,.sidebar-collapsed .collapse-btn,.sidebar-collapsed .profile-btn-collapsed{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.sidebar-collapsed .profile-btn-collapsed{min-height:0;padding:0}
.sidebar-collapsed .profile-btn-collapsed .default-avatar{width:40px;height:40px}
.sidebar-collapsed .profile-btn-collapsed .avatar-container{width:40px;height:40px;border-radius:50%;overflow:hidden}
.sidebar-collapsed .profile-btn-collapsed .avatar{width:100%;height:100%;object-fit:cover;display:block;border-radius:50%}
.profile-btn{display:flex;align-items:center;border:none;cursor:pointer;width:100%;padding:4px 8px;border-radius:25px;box-sizing:border-box;min-height:44px;transition:background 0.2s ease,box-shadow 0.2s ease,color 0.2s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.profile-menu{position:absolute;bottom:100%;left:15px;right:15px;margin-bottom:-8px;border-radius:12px;overflow:hidden;z-index:1000;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.profile-menu-collapsed{left:10px;right:10px}
.profile-menu-item{width:100%;padding:12px 16px;display:flex;align-items:center;gap:12px;border:none;background:transparent;cursor:pointer;font-size:0.95rem;font-weight:500;transition:all 0.2s ease;font-family:inherit;text-align:left}
.profile-menu-item:last-child{border-bottom:none}
.profile-menu-item svg{flex-shrink:0}
.profile-menu-collapsed .profile-menu-item{justify-content:center;padding:10px}
.profile-menu-collapsed .profile-menu-item span{display:none}
.profile-menu-enter-active,.profile-menu-leave-active{transition:all 0.2s ease;transform-origin:bottom center}
.profile-menu-enter-from,.profile-menu-leave-to{opacity:0}
.profile-btn-collapsed{width:40px;height:40px}
.profile-expanded{display:flex;align-items:center;gap:10px;overflow:hidden;min-width:0}
.avatar-container{width:36px;height:36px}
.default-avatar{width:36px;height:36px;border-radius:50%;background:transparent;border:1px solid rgba(212,175,55,0.5);display:flex;align-items:center;justify-content:center;color:#8b6b3d}
.profile-name{font-size:1rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profile-collapsed{font-size:1.2rem;color:#FFD700}
.scroll-container{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;position:relative}
.sidebar.sidebar-open~.scroll-container{overflow:hidden;transform:translateX(98vw);position:fixed;width:100%;height:100%}
.sidebar.sidebar-open~.scroll-container .chat-header{pointer-events:auto !important}
.fixed-input-container{position:absolute;left:0;right:0;bottom:0;z-index:100;pointer-events:none}
.fixed-input-container .chat-input-container,.fixed-input-container .ai-greeting,.fixed-input-container .mobile-actions-popover-container{pointer-events:auto}
.fixed-header.with-shadow{position:absolute;top:0;left:0;right:0;z-index:100;pointer-events:none}
.fixed-header.with-shadow::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:99}
.centered-content{max-width:820px;width:100%;margin:0 auto;display:flex;flex-direction:column;flex:1}
.empty-chat{display:flex;align-items:center;justify-content:center;z-index:100;height:100%;position:static;top:auto;left:auto;right:auto;bottom:auto}
.chat-header{padding:15px 20px;display:flex;justify-content:space-between;align-items:center;top:0;z-index:100;pointer-events:none}
.fixed-header .mobile-menu-btn{pointer-events:auto}
.current-session-title{font-size:1.2rem;font-weight:500;text-align:center}
.scrollable-content{flex:1;overflow-y:auto;min-height:0;-webkit-overflow-scrolling:touch}
.main-chat-area{flex:1;display:flex;flex-direction:column;overflow:hidden;width:100%;min-width:0}
.chat-messages{position:relative;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:74px 20px 108px 20px;display:flex !important;flex-direction:column !important;width:100%;min-width:100%;box-sizing:border-box;scroll-behavior:smooth;-webkit-mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%)}
.message-bubble{width:100%;flex-shrink:0}
.message-bubble.user{display:flex;flex-direction:column;align-items:flex-end;margin-top:40px;margin-bottom:40px}
.message-bubble .content{padding:12px 15px;border-radius:12px;max-width:100%;width:auto;min-width:0;word-wrap:break-word;display:flex;flex-direction:column;justify-content:center}
/* width:100% matters: .content is otherwise shrink-to-fit, so an answer with
   SHORT prose lines let the cards (width:100% OF THE CONTENT BOX) collapse to
   ~70% — v1 masked it with long paragraphs; v2's concise intros exposed it. */
.message-bubble.ai .content{border-radius:0 !important;box-shadow:none !important;color:inherit !important;padding:15px 0 !important;margin:0;width:100%}
.message-bubble.ai .typing-content{box-shadow:none !important;padding:15px 0 !important;background:transparent !important;border:transparent !important}


/* =============================TEXT CONTENT - Base Typography=========================== */
.text{line-height:1.5;word-wrap:break-word;overflow-wrap:break-word;min-width:0}
.message-bubble.ai .text{line-height:1.6;margin:0;padding:0;transition:none}
/* =================================DEEP SELECTORS======================================= */
.text :deep(strong){font-weight:600}
.text :deep(a){text-decoration:underline}
.text :deep(p){margin:0;padding:0;line-height:1.6}
.text :deep(p:first-child){margin-top:0}
.text :deep(p:last-child){margin-bottom:0}
.text :deep(h3),.text :deep(h4),.text :deep(h5){font-size:1.15em;font-weight:600;margin:16px 0 8px 0;line-height:1.4}
.text :deep(h3:first-child),.text :deep(h4:first-child){margin-top:0}
.text :deep(hr){border:none;margin:16px 0}
.text :deep(del){opacity:0.6;text-decoration:line-through}
.text :deep(blockquote){margin:12px 0;padding:12px 16px;border-radius:4px}
/* =============================LISTS - Numbered and Bulleted============================= */
.text :deep(.numbered-item),.text :deep(.bullet-item){margin:0;padding:0;line-height:1.6}
.text :deep(.numbered-item){display:block;align-items:flex-start;flex-wrap:wrap;gap:0}
.text :deep(.numbered-item strong){flex-shrink:0;min-width:2em}
.text :deep(.bullet-item strong),.text :deep(.numbered-item strong:first-child),.text :deep(.numbered-item strong:nth-child(2)){margin-right:0.3em}
.text :deep(.bullet-item){padding-left:20px;display:block}
.text :deep(.bullet-continuation){margin:0;padding-left:20px;line-height:1.6;opacity:0.95}
.text :deep(.numbered-item.indented),.text :deep(.bullet-item.indented){padding-left:24px;margin-top:2px}
.text :deep(.bullet-continuation.indented){padding-left:44px}
/* ======================SPECIAL ELEMENTS - Headers, Links, etc.========================= */
.text :deep(.section-header){font-weight:600;margin:8px 0;font-size:1.05em;line-height:1.6;display:flex;align-items:center}
.text :deep(.section-header.inline){display:inline-block;margin:0;flex-grow:1}
.text :deep(.destination-link){font-weight:500;padding:2px 6px;border-radius:4px}


.streaming-lamp{margin:0;flex-shrink:0}
/* Progress note beside the lamp, and the engine trace at the foot of a reply.
   Both are quiet by design — they report, they don't speak. */
.streaming-lamp-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.engine-stage{font-size:0.85rem;font-style:italic;opacity:0.72;animation:stageIn 0.35s ease-out}
/* The date is the fact; the time is its detail. They used to render at
   identical size and colour, which read as two separate facts. */
.pd-price-approx{margin-left:8px;font-size:0.86em;opacity:0.62;white-space:nowrap}
.info-modal .event-schedule-primary{font-weight:600}
.info-modal .event-schedule-secondary{font-size:0.86em;opacity:0.72;font-variant-numeric:tabular-nums}
@keyframes stageIn{from{opacity:0}to{opacity:0.72}}
.engine-debug{font-size:0.68rem;letter-spacing:0.01em;opacity:0.42;margin-top:10px;font-variant-numeric:tabular-nums}
.genie-chat-container.night-mode .engine-stage,.genie-chat-container.night-mode .engine-debug{color:#aeb8c7}
.genie-chat-container.day-mode .engine-stage,.genie-chat-container.day-mode .engine-debug{color:rgba(92,74,66,0.85)}
.recommendation-card{position:relative;border-radius:12px;overflow:hidden;transition:all 0.3s ease;cursor:pointer;display:flex;flex-direction:column;height:100%;flex:1 1 auto;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.inline-recommendation-wrapper{margin:16px 0 16px 0;display:flex;justify-content:flex-start}
/* Flex items shrink to content — a short description shrank the whole card.
   Full width regardless of text length (chat inline cards only; other card
   surfaces keep their own sizing). */
.inline-recommendation-wrapper .rec-card-wrapper{width:100%}
/* width:100% so the card is horizontally full at ALL times — including DURING
   streaming (that template omits .inline-card) and when the description ends
   up short. The image/content never dictates card width. */
.inline-recommendation-wrapper .recommendation-card{margin-left:0;float:left;max-width:100%;width:100%;display:block}
.inline-card{width:100%}
.large-card{display:flex;flex-direction:column;border-radius:12px;overflow:hidden;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.large-card .rec-image{height:auto;aspect-ratio:3 / 2;max-height:380px;width:100%;box-sizing:border-box}
.large-card .rec-details{padding:16px}
.large-card .rec-name{font-size:1.3rem;font-weight:600;margin-bottom:8px}
.large-card .rec-type{font-size:1rem;margin-bottom:5px;font-weight:500}
.large-card .rec-description{margin-bottom:5px;line-height:1.5;color:#666}
.large-card .rec-metadata{display:flex;flex-direction:column}
.large-card .rec-distance,.large-card .rec-location{font-size:0.9rem}
.large-card .text-action-btn{padding:10px 16px}
.large-card .overlay-actions{gap:15px}
/* Desktop: while streaming, the large card shrinks-to-fit (float) so it grows live with
   the text. Once the message finishes (msg-complete), settle every large card to a uniform
   full width so a short description no longer leaves a half-sized card. Mobile already
   stacks full-width, so this is desktop-only. */
@media (min-width:769px){.msg-complete .large-card{width:100%}}
.rec-image{height:140px;overflow:hidden;position:relative;flex-shrink:0}
.rec-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;opacity:0;animation:fadeIn 0.5s ease-in forwards}
.rec-image-placeholder{height:120px;background:rgba(255,255,255,0.1);align-items:center;justify-content:center;color:rgba(255,255,255,0.5);border-radius:8px 8px 0 0}
/* ── Partner tier label (below card) ───────────────────────────────────── */
.rec-card-wrapper{display:flex;flex-direction:column;align-items:stretch;border-radius:12px;height:100%}
.partner-label{display:flex;align-items:center;justify-content:center;gap:4px;font-size:0.68rem;font-weight:400;letter-spacing:0.03em;text-align:center;pointer-events:none;opacity:0.85;flex-shrink:0}
.partner-label svg{flex-shrink:0;vertical-align:middle}
.night-mode .partner-label--verified{color:#22c556b1}
.day-mode .partner-label--verified{color:#22c556ea}
.partner-label--spotlight{color:#3b9fdda2}
.night-mode .partner-label--signature{color:#ffbf0085}
.day-mode .partner-label--signature{color:#d39510}

/* ── Card glow per tier ────────────────────────────────────────────────── */
.card-glow--verified .recommendation-card{box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.card-glow--spotlight .recommendation-card{box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.card-glow--signature .recommendation-card{box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.rec-image.loading-skeleton{background-size:200% 100%;animation:shimmer 2s infinite;position:relative;overflow:hidden}
/* Source link on an AI-found event — quiet by default, since it is a verification
   affordance rather than a call to action. */
.rec-event-source{display:inline-flex;align-items:center;gap:4px;font-size:0.6875rem;margin:2px 0 4px;text-decoration:none;opacity:.72}
/* Source moved BELOW the card (into .rec-card-bottom). Absolutely centered in
   that row so "Check listing" sits in the MIDDLE under the card, independent of
   the partner badge (left) and the feedback buttons (right, margin-left:auto). */
.rec-event-source--below{margin:0;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
.rec-event-source:hover{opacity:1}
.genie-chat-container.night-mode .rec-event-source{color:rgba(255,255,255,0.72)}
.genie-chat-container.day-mode .rec-event-source{color:rgba(160,82,45,0.9)}
/* Date-card: a settled, non-animated state — deliberately static so it reads as
   "this event has no photo", not "the photo is still loading". */
.rec-image--event{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.rec-image-event-mark{display:flex;align-items:center;justify-content:center;opacity:.45}
.genie-chat-container.night-mode .rec-image--event{background:rgba(255,255,255,0.06)}
.genie-chat-container.night-mode .rec-image-event-mark{color:rgba(255,255,255,0.75)}
.genie-chat-container.day-mode .rec-image--event{background:rgba(160,82,45,0.10)}
.genie-chat-container.day-mode .rec-image-event-mark{color:rgba(160,82,45,0.85)}
.skeleton-shimmer{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center}
.image-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.3));display:flex;align-items:center;justify-content:center;opacity:0;z-index:2}
.recommendation-card:hover .image-overlay{opacity:1}
.overlay-actions{display:flex;gap:10px}
.text-action-btn{padding:8px;border:none;border-radius:25px;cursor:pointer;font-size:0.8rem;line-height:1.1;font-weight:500;transition:all 0.25s ease;min-width:80px;text-align:center;backdrop-filter:blur(1px) saturate(160%);-webkit-backdrop-filter:blur(1px) saturate(160%)}
.rec-details{padding:12px 12px 6px 12px}
.rec-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.rec-name{font-weight:500;margin-bottom:4px;flex:1;line-height:1.3}
.image-request-btn{width:2.375rem;height:2.375rem;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;flex-shrink:0;position:relative;overflow:hidden;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.image-request-btn:disabled{cursor:not-allowed;opacity:0.6;pointer-events:none}
.image-request-btn .loading-icon{animation:spin 1s linear infinite}
/* .quick-actions{margin-top:12px;padding-top:8px} */
.action-chip{padding:5px 12px;border-radius:20px;cursor:pointer;font-size:0.85rem;transition:all 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.itin-lamp{margin-top:6px}
.itin-breakfast-q{font-size:0.82rem;opacity:0.8;align-self:center;margin-right:2px}
.itin-nearby-desc{font-size:0.82rem;line-height:1.4;opacity:0.75;margin:2px 0 8px}
/* Itinerary clarifier: hotel-name text input — mirrors the chat-input-container
   glass (day: warm white + brown glow; night: purple-tinted) and the
   input-wrapper text/placeholder colours, so it reads as native. */
.itin-hotel-row{padding:2px 0 8px}
.itin-hotel-input{width:100%;box-sizing:border-box;padding:10px 14px;border-radius:20px;border:none;font-size:0.9rem;font-family:inherit;outline:none;transition:all 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.genie-chat-container.night-mode .itin-hotel-input{background:rgba(139,92,246,0.10);color:#d5dce4;box-shadow:0 0 1px rgba(0,0,0,0.45),inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .itin-hotel-input::placeholder{color:rgba(226,232,240,0.5)}
.genie-chat-container.night-mode .itin-hotel-input:focus{background:rgba(139,92,246,0.16);box-shadow:0 0 1px rgba(0,0,0,0.45),inset 0 0 0 0.8px rgba(255,255,255,0.16)}
.genie-chat-container.day-mode .itin-hotel-input{background:rgba(255,253,248,0.62);color:#3c2a1e;box-shadow:0 0 10px rgba(139,69,19,0.06),inset 0 0 0 1px rgba(255,255,255,0.7)}
.genie-chat-container.day-mode .itin-hotel-input::placeholder{color:rgba(92,74,66,0.7)}
.genie-chat-container.day-mode .itin-hotel-input:focus{background:rgba(255,253,248,0.8);box-shadow:0 0 10px rgba(139,69,19,0.08),inset 0 0 0 1px rgba(255,255,255,0.9)}
/* Shopping clarifier attached to the input box */
.input-clarifier{display:flex;flex-direction:column;gap:8px;padding:10px;margin-bottom:2px;box-sizing:border-box}
.input-clarifier-head{display:flex;align-items:center;justify-content:space-between}
.input-clarifier-title{font-size:0.9rem;font-weight:500}
.input-clarifier-close{background:transparent;border:none;color:#aaa;border-radius:8px;padding:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.input-clarifier-chips{display:flex;flex-wrap:wrap;gap:8px}
.itin-budget-fields{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 4px}
.itin-budget-field{display:flex;flex-direction:column;gap:4px}
.itin-budget-label{font-size:0.78rem;opacity:0.75}
.itin-budget-input{display:inline-flex;align-items:center;gap:6px;border-radius:12px;padding:0 10px;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.itin-budget-input input{width:110px;background:transparent;border:none;outline:none;padding:9px 0;font-size:0.95rem;color:inherit;font-family:inherit}
.itin-budget-cur{font-size:0.8rem;font-weight:600;opacity:0.7}
.itin-budget-people{width:64px;border-radius:12px;border:none;outline:none;padding:9px 10px;font-size:0.95rem;color:inherit;font-family:inherit;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.itin-budget-hint{font-size:0.72rem;opacity:0.6;margin:2px 0 8px}
/* Hide the native number-input spinner arrows — they look cheap. Inputs stay
   numeric via type=number + inputmode. */
.itin-budget-input input::-webkit-outer-spin-button,.itin-budget-input input::-webkit-inner-spin-button,.itin-budget-people::-webkit-outer-spin-button,.itin-budget-people::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.itin-budget-input input,.itin-budget-people{-moz-appearance:textfield;appearance:textfield}
.chip-primary{font-weight:600}
.genie-chat-container.night-mode .itin-budget-input,.genie-chat-container.night-mode .itin-budget-people{background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.day-mode .itin-budget-input,.genie-chat-container.day-mode .itin-budget-people{background:rgba(255,255,255,0.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.night-mode .input-clarifier-title{color:#94a3b8}
.genie-chat-container.night-mode .input-clarifier-close{background:rgba(255,255,255,0.06);color:#94a3b8;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .input-clarifier-close:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.day-mode .input-clarifier-title{color:#8B4513}
.genie-chat-container.day-mode .input-clarifier-close{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .input-clarifier-close:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}

.preference-bar{display:flex;align-items:flex-start;gap:4px;padding:9px 8px 17px 10px;box-sizing:border-box}
.preference-bar--desktop{flex-wrap:wrap}
.preference-bar--mobile{flex-direction:column;align-items:flex-start}
.preference-bar-lead{display:inline-flex;align-items:center;gap:6px;font-size:0.85rem;font-weight:500;white-space:nowrap;flex-shrink:0}
.preference-bar--desktop .preference-bar-lead{align-self:center}
.preference-bar-chips{display:flex;align-items:center;gap:4px;min-width:0}
.preference-bar--desktop .preference-bar-chips{flex-wrap:wrap}
.preference-bar--mobile .preference-bar-chips{flex-direction:column;align-items:flex-start;gap:6px;flex:1;min-width:0}
.preference-chip{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;padding:4px 9px;border-radius:20px;font-size:0.82rem;cursor:pointer;border:none;background:transparent;box-shadow:none;font-family:inherit}
.preference-chip-ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.preference-chip-ic svg{width:15px;height:15px;display:block}
.preference-chip-label{overflow:hidden;text-overflow:ellipsis;max-width:200px}
.preference-bar--mobile .preference-chip-label{max-width:170px}
/* Open/close animation is driven by the shared JS hooks (clarifierEnter /
   clarifierAfterEnter / clarifierLeave) — same smooth expand as the shopping
   clarifier. No CSS transition classes needed. */

.genie-chat-container.night-mode .preference-bar-lead{color:#c084fc}
.genie-chat-container.night-mode .preference-chip{background:transparent;color:#cdd5e0;box-shadow:none}
.genie-chat-container.night-mode .preference-chip-ic{color:#c084fc}

.genie-chat-container.day-mode .preference-bar-lead{color:#8B4513}
.genie-chat-container.day-mode .preference-chip{background:transparent;color:rgba(92,74,66,0.92);box-shadow:none}
.genie-chat-container.day-mode .preference-chip-ic{color:#A0522D}
/* Open/close is driven by JS transition hooks (clarifierEnter / clarifierLeave)
   which animate to the element's real height for symmetric smoothness. */
.section-title{font-weight:500;margin-bottom:10px}
.rec-type{font-size:0.8rem;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
/* ── Event date/time row on the rec card.
   A dedicated row directly under the category line so the date/time
   reads as the event's primary fact. Single line: date + time inline. */
.rec-event-schedule{display:flex; align-items:center; gap:5px; margin-top:1px; font-variant-numeric:tabular-nums}
.rec-event-icon{flex-shrink:0;opacity:0.85}
.rec-event-schedule-text{display:flex;align-items:baseline;gap:6px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.rec-event-schedule-primary{font-size:0.8rem;font-weight:600}
/* dot separator before the time, only when a time is present */
.rec-event-schedule-secondary{font-size:0.78rem;opacity:0.7}
.rec-event-schedule-secondary::before{content:"·";margin-right:6px;opacity:0.6;font-weight:600}
.large-card .rec-event-schedule-primary{font-size:0.9rem}
.large-card .rec-event-schedule-secondary{font-size:0.86rem}
/* "Ended" pill — small, warm-grey, sits at the end of the event row
   when the event is already in the past. Defensive: the discoverability
   filter normally hides these from new recs, but old chat history may
   reference an event that has since ended. */
.rec-event-ended{display:inline-flex; align-items:center; padding:1px 8px; border-radius:10px; font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; background:rgba(168,162,158,0.18); color:#a8a29e; margin-left:auto; flex-shrink:0; align-self:center}
/* ── Info-modal event row.
   Distinct from regular info-rows so the date/time stands out as the
   event's primary fact. The "Ended" pill nests inside .value on the
   same line so users reading the modal see the state immediately. */
.info-modal .info-row--event .value.event-schedule-value{display:flex; flex-wrap:wrap; align-items:center; gap:6px 12px}
.event-schedule-primary{font-weight:600;font-size:0.95rem}
.event-schedule-secondary{opacity:0.75;font-size:0.88rem}
.event-schedule-ended-pill{display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:14px; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; background:rgba(168,162,158,0.18); color:#a8a29e; margin-left:auto }
.rec-location{font-size:0.8rem;color:#828f9e}
.view-more-container{margin-top:15px;text-align:center;padding-top:15px}
.view-more-btn{padding:8px 16px;border-radius:20px;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;gap:6px;margin:0 auto;transition:all 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.view-more-hint{font-size:0.8rem;margin-top:5px;font-style:italic}
.view-more-loading{margin-top:15px;padding:15px 0;display:flex;align-items:center;gap:12px;justify-content:flex-start}
.loading-more-lamp{margin:0;flex-shrink:0}
.loading-more-text{font-size:0.85rem;font-style:italic;transition:opacity 1s ease-out}
.typing-lamp{margin-left:0;flex-shrink:0}
.ai-greeting{font-size:1.5rem;font-weight:150;padding:0 10px 14px 10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:15px}
.greeting-icon{align-self:stretch;height:auto;width:auto;min-height:44px;max-height:45px;flex-shrink:0;
  /* Own compositing layer: the day/night glow is a filter:drop-shadow, which
     is re-derived from the PNG alpha on every repaint. Promoted, it is
     rasterized once and translated with the icon when the empty-chat block
     re-centres, instead of being redrawn a frame behind it. */
  will-change:transform;transform:translateZ(0)}
.greeting{font-size:1.3rem;font-weight:150;margin:0;line-height:1.35;display:flex;align-items:center;justify-content:center}
/* transition is an explicit LIST, never `all`: this element carries a 20px
   backdrop-filter, and `all` animates that too — so every composer resize
   spent 300ms re-sampling and re-blurring the backdrop each frame, with a
   second nested blur in .input-wrapper on top of it. The greeting icon's
   drop-shadow had to re-rasterize in those same frames and landed late,
   reading as a glow that trailed behind the lamp (founder 2026-09-03).
   Only the day/night fade needs animating here. */
.chat-input-container{padding:8px;border-top:none;border-radius:32px;margin:0 15px;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);position:relative;bottom:0;z-index:100;max-width:none;box-sizing:border-box;transition:background 0.3s ease,box-shadow 0.3s ease}
.input-wrapper{position:relative;display:flex;flex:1;align-items:flex-start;border-radius:25px;overflow:hidden;transition:background 0.3s ease,box-shadow 0.3s ease,color 0.3s ease;backdrop-filter:blur(16px) saturate(170%);-webkit-backdrop-filter:blur(16px) saturate(170%);max-height:200px}
.input-wrapper textarea{flex:1;background:transparent;border:none;padding:14px 52px 14px 15px;font-size:1rem;line-height:22px;resize:none;overflow-y:auto;min-height:50px;max-height:200px}
.input-wrapper textarea:focus{outline:none}
.send-button{position:absolute;right:6px;bottom:5px;background:transparent;border:none;margin:0;border-radius:50%;cursor:pointer;color:inherit;font-size:1.2rem;height:40px;width:40px;display:flex;justify-content:center;align-items:center;padding:0;z-index:2;transform:none;top:auto;transition:all 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.send-button svg{width:24px;height:24px;flex-shrink:0;transition:all 0.3s ease}
.send-button:hover{background:transparent}
.mode-toggle{display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:16px;border:none;cursor:pointer;transition:all 0.3s ease;flex-shrink:0;font-size:0.8rem;font-weight:500;white-space:nowrap;min-width:110px;box-sizing:border-box}
.ai-note{font-size:0.8rem;font-weight:100;padding:0 10px;text-align:center;width:100%;display:block}
/* ── Profile modal: scrollable body ──
   `.modal-content` is overflow:hidden (it clips the rounded corners) and had
   no max-height, so a profile with many interests simply grew past the
   viewport and the overflow was unreachable — on mobile there was no way to
   scroll to it at all. The header now stays put and the body scrolls.
   dvh follows vh so it wins on mobile browsers, where vh ignores the
   collapsing address bar and overshoots. */
.profile-modal .modal-content{display:flex;flex-direction:column;max-height:88vh;max-height:88dvh}
/* Floating header — the same recipe as the settings modal: the bar sits over
   the scroll area on a blurred backdrop that fades out downward, so content
   passes UNDER it instead of stopping at a hard edge. `pointer-events:none`
   on the bar (re-enabled on its controls) keeps the covered strip scrollable. */
.profile-modal .modal-content{position:relative}
.profile-modal .modal-header{position:absolute;top:0;left:0;right:0;z-index:4;background:transparent;pointer-events:none;padding:12px 12px 10px 18px}
.profile-modal .modal-header::before{content:"";position:absolute;inset:0;z-index:-1;-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);-webkit-mask-image:linear-gradient(to bottom,#000 52%,transparent 100%);mask-image:linear-gradient(to bottom,#000 52%,transparent 100%)}
.profile-modal .modal-content.night .modal-header::before{background:rgba(40,30,62,0.55)}
.profile-modal .modal-content.day .modal-header::before{background:rgba(255,251,245,0.6)}
.profile-modal .modal-header h3,.profile-modal .modal-header .close-btn{pointer-events:auto}
.profile-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-top:54px;-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 20px),rgba(0,0,0,0.4) calc(100% - 8px),transparent 100%);mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 20px),rgba(0,0,0,0.4) calc(100% - 8px),transparent 100%)}
.profile-body::-webkit-scrollbar{width:6px}
.profile-body::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.3);border-radius:999px}

/* Plan lives in the title now, so it costs no vertical space. The h3 uses a
   gradient text-fill, which children inherit — hence the explicit reset. */
.modal-title-plan{-webkit-text-fill-color:initial;font-weight:600;font-size:0.85rem;letter-spacing:0.01em}
.modal-title-plan.is-free{color:#8a8a8a;opacity:0.85}
/* Premium wears the SAME gold->orange gradient as the modal title, so
   "Profile · Premium" reads as one piece of type rather than a heading with a
   coloured word bolted on. It needs its own background because background is
   not inherited — the parent h3's gradient stops at the h3's own text — and
   its own transparent fill to undo the `initial` set on the base class above.
   `color` stays as the fallback for engines without background-clip:text.
   Identical in both themes, exactly as the h3 is. */
.modal-title-plan.is-premium{
  color:#D4AF37;
  background:linear-gradient(0deg,#D4AF37,#FF8C00);
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;
}
.modal-content.night .modal-title-plan.is-free{color:#94a3b8}

/* ── Profile identity row ──
   Was column + centred, which parked the name in the middle of the modal with
   dead space either side. Now avatar / name / plan read across one line. */
.profile-info{display:flex;flex-direction:row;align-items:center;gap:13px;text-align:left;padding:0 18px 15px}
.profile-details{flex:1;min-width:0}
.profile-details h4{margin:0 0 3px 0;font-size:1.22rem;font-weight:700;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profile-details p{margin:0;opacity:0.55;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profile-plan-tag{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.plan-expiry{font-size: 0.65625rem;font-weight:600;opacity:0.5;white-space:nowrap;letter-spacing:0.01em}

/* ── Preferences: tiles, not bordered rows ── */
.prefs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 11px}
.prefs-title{margin:0;font-size:1rem;font-weight:700;color:#D4AF37;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.prefs-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.pref-tile{display:flex;flex-direction:column;gap:7px;padding:13px 14px;border-radius:14px;background:rgba(120,120,120,0.08);min-width:0}
.modal-content.night .pref-tile{background:rgba(255,255,255,0.055)}
.pref-tile--wide{grid-column:1 / -1}
.pref-tile-label{display:flex;align-items:center;gap:7px;font-size: 0.71875rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;opacity:0.55}
.pref-tile-value{font-size: 0.84375rem;font-weight:600;line-height:1.35;overflow-wrap:anywhere}
.pref-tile-value.is-empty{font-weight:500;opacity:0.45}
.pref-chips{display:flex;flex-wrap:wrap;gap:6px}
.pref-chip{padding:4.5px 11px;border-radius:999px;font-size:0.75rem;font-weight:600;background:rgba(120,120,120,0.15);color:#4a4a4a}
.modal-content.night .pref-chip{background:rgba(255,255,255,0.1);color:#cbd5e1}

/* ── Plan & usage card (profile modal) ── */
.plan-card{margin:0 18px 20px;padding:15px 16px 16px;border-radius:16px;background:rgba(255,255,255,0.5)}
.modal-content.night .plan-card{background:rgba(255,255,255,0.1)}
.plan-card--premium{background:linear-gradient(135deg,rgba(212,175,55,0.22),rgba(255,240,214,0.55))}
.modal-content.night .plan-card--premium{background:linear-gradient(135deg,rgba(212,175,55,0.22),rgba(255,255,255,0.08))}
.plan-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.plan-label{font-size:0.8125rem;font-weight:600;opacity:0.75}
.plan-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:0.75rem;font-weight:700;letter-spacing:0.02em}
.plan-badge.is-free{background:rgba(120,120,120,0.15);color:inherit;opacity:0.7}
.plan-badge.is-premium{background:linear-gradient(135deg,rgb(212,175,55),rgb(255,140,0));color:#fff}
.plan-usage{display:flex;flex-direction:column;gap:13px}
.plan-meter-top{display:flex;align-items:baseline;justify-content:space-between;font-size: 0.78125rem;margin-bottom:6px;opacity:0.8}
.plan-meter-num{font-weight:700;font-variant-numeric:tabular-nums;opacity:1}
/* Track: a warm tint rather than neutral grey, so an empty bar still belongs
   to this page. */
.plan-bar{height:5px;border-radius:999px;background:rgba(120,120,120,0.18);overflow:hidden}
.modal-content.night .plan-bar{background:rgba(255,255,255,0.09)}
/* Fill escalates INSIDE the warm family — the green read as a borrowed
   status-widget colour against the gold page. Normal is the brand gradient
   itself; warning steps to solid brand orange; critical breaks to red, which
   is the one point where standing out matters more than fitting in.
   The gradient-to-solid change carries the first step as much as the hue
   does, since gold and orange sit close together. */
.plan-bar-fill{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#D4AF37,#E8A33D);transition:width 0.35s ease,background 0.3s ease}
.plan-bar-fill.is-warning{background:#FF8C00}
.plan-bar-fill.is-critical{background:#E05555}
.plan-cooldown{padding:9px 11px;border-radius:11px;font-size: 0.78125rem;font-weight:600;color:#e05555;background:rgba(224,85,85,0.12)}
.plan-reset{font-size: 0.71875rem;opacity:0.6;margin-top:2px}
.plan-meter-skeleton{display:block;height:26px;border-radius:8px;background:rgba(128,128,128,0.14);animation:planPulse 1.4s ease-in-out infinite}
@keyframes planPulse{50%{opacity:0.45}}
@media (prefers-reduced-motion:reduce){.plan-meter-skeleton{animation:none}.plan-bar-fill{transition:none}}
.plan-cta{width:auto;margin:14px 0 0;padding:7px 14px;border:none;border-radius:999px;cursor:pointer;font-family:inherit;font-size: 0.78125rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;color:#3c2a1e;background:rgba(120,120,120,0.18);transition:background 0.18s ease,transform 0.15s ease}
.modal-content.night .plan-cta{color:#e2e8f0;background:rgba(255,255,255,0.14)}
.plan-cta:hover{background:rgba(120,120,120,0.26)}
.modal-content.night .plan-cta:hover{background:rgba(255,255,255,0.2)}
.plan-cta:active{transform:scale(0.985)}

.profile-modal{position:fixed;inset:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000}
.modal-content{border-radius:15px;width:90%;max-width:500px;overflow:hidden}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:12px 12px 8px 18px}
.modal-header h3{margin:0;font-size:1.25rem;font-weight:600;color:#FFD700;background:linear-gradient(0deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.interest-tag{display:inline-flex;align-items:center;gap:4px;padding:0;background:transparent;box-shadow:none}
.interest-spark{width:11px;height:11px;flex-shrink:0;opacity:0.9}
.close-btn{background:transparent;border:none;color:#aaa;border-radius:6px;padding:5px;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10}
.profile-modal .close-btn{width:34px;height:34px;border-radius:10px;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);color:#94a3b8;backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14);transition:background 0.18s ease,transform 0.15s ease}
.profile-modal .close-btn svg{width:18px;height:18px}
.profile-modal .close-btn:active{transform:scale(0.9)}
.loading-container{text-align:center;padding:0 20px}
.avatar-container{width:60px;height:60px;border-radius:50%;padding:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(6px) saturate(180%);-webkit-backdrop-filter:blur(6px) saturate(180%)}
.profile-avatar{width:100%;height:100%;border:none;border-radius:50%;object-fit:cover;display:block}
.profile-avatar.default-avatar{background:transparent;border:none;display:flex;align-items:center;justify-content:center;color:#A0AEC0}
.profile-preferences{padding:5px 18px 18px 18px}
.profile-preferences h4{color:#D4AF37;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:1.2rem;margin-top:0}
.preference-item{display:flex;justify-content:space-between;align-items:flex-start;padding:11px 0;width:100%;border-bottom:1px solid rgba(255,255,255,0.08)}
.preference-item>span:first-child{flex-shrink:0;min-width:100px;font-weight:600;display:flex;align-items:center;gap:8px}
.pref-ic{width:15px;height:15px;flex-shrink:0}
.preference-value{flex-grow:1;margin-left:10px;text-align:right}
.interests-container{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:12px}
.edit-prefs-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:fit-content;max-width:100%;padding:7px 14px;margin:0;font-size:0.85rem;flex-shrink:0;background:rgba(255,255,255,0.06);color:#A0AEC0;border:none;border-radius:25px;font-size:0.95rem;cursor:pointer;font-weight:600;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1);transition:background 0.18s ease,transform 0.15s ease}
.edit-prefs-btn:hover{background:rgba(255,255,255,0.12)}
.edit-prefs-btn:active{transform:scale(0.98)}
@keyframes profileModalIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.profile-modal{animation:profileOverlayIn 0.25s ease}
.profile-modal .modal-content{animation:profileModalIn 0.38s cubic-bezier(0.22,1,0.36,1)}
@keyframes profileOverlayIn{from{opacity:0}to{opacity:1}}
.info-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100000}
.info-modal{border-radius:12px;max-width:500px;width:90%;overflow:hidden;position:relative;display:flex;flex-direction:column}
.modal-body{padding:0 20px 20px 20px;max-height:60vh;overflow-y:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
/* Info-modal: transparent floating header — body scrolls underneath and dissolves (like the other panels) */
.info-modal .modal-header{position:relative;z-index:4;background:transparent;border:none;padding:14px 20px 8px 20px;flex-shrink:0}
.info-modal .modal-header h3{pointer-events:auto;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.25}
.info-modal .modal-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding-top:2px;-webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 14px),transparent 100%);mask-image:linear-gradient(to bottom,#000 calc(100% - 14px),transparent 100%)}
.place-details{display:flex;flex-direction:column;gap:12px}
.info-row{display:flex;flex-direction:column}
.see-more-btn{background:none;border:none;color:#D4AF37;cursor:pointer;font-size:0.875rem;padding:4px 0;text-decoration:underline}
.see-more-btn:hover{color:#FF8C00}
.hours-list{font-size:0.875rem}
.hours-list div{padding:2px 0}
.label{font-weight:600;color:#4a5568;font-size:0.875rem}
.review-count{color:#718096;font-size:0.875rem}
.value{color:#2d3748;line-height:1.5}
.value a{color:#D4AF37;text-decoration:none;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.value a:hover{text-decoration:underline;color:#FF8C00}
.modal-actions{display:flex;padding:12px 0 0 0;gap:20px}
.highlights-list{display:flex;flex-wrap:wrap;gap:6px;padding-top:2px}
.highlight-tag{font-size:0.6875rem;padding:2px 8px;border-radius:20px;background:rgba(139,92,246,0.12);color:#a78bfa}
.social-links{display:flex;flex-wrap:wrap;gap:8px;padding-top:2px}
.social-link{display:inline-flex;align-items:center;gap:5px;font-size:0.75rem;font-weight:500;padding:4px 10px;border-radius:20px;text-decoration:none;transition:opacity 0.15s}
.social-link:hover{opacity:0.8}
.social-link--instagram{background:rgba(225,48,108,0.12);color:#e1306c}
.social-link--facebook{background:rgba(24,119,242,0.12);color:#1877f2}
.social-link--tripadvisor{background:rgba(52,168,83,0.12);color:#34a853}
.btn-primary{flex:1;padding:10px;background:linear-gradient(45deg,#D4AF37,#FF8C00);color:white;border:none;border-radius:25px;font-weight:500;font-size:0.9rem;cursor:pointer}
.btn-primary:hover{box-shadow:0 0 6px rgba(212,175,55)}
.btn-secondary{flex:1;padding:10px;background:transparent;border-radius:25px;color:#4a5568;font-weight:500;font-size:0.9rem;cursor:pointer;transition:all 0.2s ease}
.info-modal .btn-primary,.info-modal .btn-secondary{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);transition:all 0.2s ease}
.info-modal.night .btn-primary{background:linear-gradient(45deg,rgba(212,175,55,0.6),rgba(255,140,0,0.6));color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.info-modal.night .btn-primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.2)}
.info-modal.day .btn-primary{background:linear-gradient(45deg,rgba(212,175,55,0.5),rgba(255,140,0,0.5));color:#fff;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.35)}
.info-modal.day .btn-primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.72),rgba(255,140,0,0.72));box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.4)}
.fullscreen-image-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:3000;display:flex;align-items:center;justify-content:center}
.fullscreen-image-container{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.fullscreen-image{max-width:95%;max-height:95%;min-width:700px;min-height:600px;width:auto;height:auto;object-fit:contain;border-radius:8px;box-shadow:0 4px 30px rgba(0,0,0,0.5)}
.fullscreen-nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:54px;height:54px;background:rgba(255,255,255,0.16);border:none;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all 0.2s ease;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28),0 4px 18px rgba(0,0,0,0.35)}
.fullscreen-nav-btn svg{width:22px;height:22px;stroke-width:2.4;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.45))}
.fullscreen-nav-btn:hover{background:rgba(255,255,255,0.28);transform:translateY(-50%) scale(1.06)}
.fullscreen-nav-btn:disabled{opacity:0.35;cursor:not-allowed;transform:translateY(-50%) scale(1)}
.fullscreen-prev{left:30px}
.fullscreen-next{right:30px}
.fullscreen-counter{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.16);color:#fff;padding:8px 16px;border-radius:20px;font-size:0.9rem;font-weight:600;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28),0 4px 18px rgba(0,0,0,0.3)}
.fullscreen-close-btn{position:absolute;top:30px;right:30px;background:rgba(255,255,255,0.16);border:none;border-radius:50%;width:44px;height:44px;color:#fff;display:flex;align-items:center;justify-content:center;z-index:10;cursor:pointer;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28),0 4px 18px rgba(0,0,0,0.35);transition:all 0.2s ease}
.fullscreen-close-btn svg{width:20px;height:20px;stroke-width:2.4;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.45))}
.fullscreen-close-btn:hover{background:rgba(255,255,255,0.28);transform:scale(1.06)}
.fullscreen-close-btn:active{transform:scale(0.94)}
.fullscreen-nav-btn:active{transform:translateY(-50%) scale(0.94)}
.recommendations{margin-top:24px;padding-top:15px}
.streaming-recommendations{opacity:1;transition:opacity 0.3s ease}
.recommendation-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));justify-content:center;align-items:stretch;gap:15px;margin-top:10px}
/* Ordinary grid cards. Mobile mirrors the itinerary card's 16:9 (proportional,
   no zoom, ~200px) — height:auto lets aspect-ratio govern over the base 140px.
   Desktop overrides with a fixed 190px (a tuned value; easy to change later). */
.recommendation-grid .rec-image{height:auto;aspect-ratio:16 / 9}
@media (min-width:769px){.recommendation-grid .rec-image{height:190px}}
.disabled-cooldown .overlay-actions{opacity:0.5}
.genie-chat-container.night-mode .input-wrapper textarea.input-disabled::placeholder{color:rgba(226,232,240,0.5);opacity:1}
.genie-chat-container.day-mode .input-wrapper textarea.input-disabled::placeholder{color:#8B4513;opacity:0.9}
.text-action-btn.disabled-cooldown,.view-more-btn.disabled-cooldown,.image-request-btn.disabled-cooldown,.mode-toggle.disabled-cooldown,.mobile-mode-toggle.disabled-cooldown{opacity:0.3;pointer-events:none}
.send-button.disabled-cooldown{opacity:0.1;pointer-events:none}
.rec-image-placeholder{display:none}
.mode-toggle-inline.with-text{width:auto;padding:0 14px;border-radius:30px;gap:6px}
.mode-label{font-size:0.9rem;font-weight:500;white-space:nowrap}
.input-row{display:flex;align-items:flex-end;gap:8px;width:100%}
.mode-toggle-inline{display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all 0.25s ease;padding:0;border-radius:50%;width:50px;height:50px;flex-shrink:0;align-self:flex-end;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.mode-toggle-inline.disabled-cooldown{opacity:0.5;pointer-events:none}
.mobile-actions-popover-container{position:relative;display:flex}
.mobile-actions-popover{position:absolute;bottom:calc(100% + 50px);right:24px;border-radius:12px;z-index:1000;margin-bottom:8px;overflow:hidden;display:flex;flex-direction:column;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.popover-actions-list{display:flex;flex-direction:column;max-height:450px;overflow-y:auto}
.popover-action-btn{display:flex;justify-content:center;align-items:center;padding:10px 12px;border:none;background:transparent;text-align:center;cursor:pointer;transition:all 0.2s ease}
.mobile-toggle-inline{display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;transition:all 0.25s ease;padding:0;border-radius:50%;margin-right:4px;position:absolute;right:46px;bottom:5px;z-index:2;width:40px;height:40px}
.mobile-toggle-inline svg{transition:transform 0.2s ease}
.mobile-toggle-inline:hover svg{transform:scale(1.18)}
.mobile-toggle-inline.disabled-cooldown{opacity:0.5;pointer-events:none}
.popover-action-label{font-weight:400;font-size:0.9rem}
.actions-popover-enter-active,.actions-popover-leave-active{transition:all 0.2s ease;transform-origin:bottom right}
.actions-popover-enter-from,.actions-popover-leave-to{opacity:0;transform:scale(0.95) translateY(10px)}
.actions-popover-enter-to,.actions-popover-leave-from{opacity:1;transform:scale(1) translateY(0)}
.popover-action-btn.action-disabled,.popover-action-btn.disabled-cooldown{opacity:0.5;pointer-events:none}
.inline-preference-btn{background:transparent; display:inline;margin:0 2px;border:none;border-radius:25px;font-size:inherit;font-weight:500;cursor:pointer;transition:all 0.2s ease;font-family:inherit;line-height:inherit}
.text :deep(.inline-preference-btn){background:transparent; display:inline;border:none;margin:0 2px;border-radius:25px;font-size:inherit;font-weight:500;cursor:pointer;transition:all 0.2s ease;font-family:inherit;line-height:inherit}
.fade-enter-active,.fade-leave-active{transition:opacity 1s ease-out}
.fade-enter-from,.fade-leave-to{opacity:0}
.text-action-btn:disabled { opacity:0.3; pointer-events:none }


/* ==================================================================================================== */
/*                                        NIGHT-MODE STYLES
/* ==================================================================================================== */
.genie-chat-container.night-mode{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);color:#aeb8c7}
.genie-chat-container.night-mode .sidebar{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%)}
.genie-chat-container.night-mode .fixed-header.with-shadow::after{background:transparent}
.genie-chat-container.night-mode .fixed-header.with-shadow{background:linear-gradient(to bottom,rgba(10,1,24,10) 0%,rgba(10,1,24,1) 1%,rgba(10,1,24,0) 100%)}
.genie-chat-container.night-mode .fixed-input-container:not(.empty-chat){background:linear-gradient(to top,rgba(22,33,62,1) 0%,rgba(22,33,62,1) 1%,rgba(22,33,62,0) 100%)}
.genie-chat-container.night-mode .section-title,.genie-chat-container.night-mode .results-count,.genie-chat-container.night-mode .rec-type{color:#c084fc}
.genie-chat-container.night-mode .rec-event-icon,.genie-chat-container.night-mode .rec-event-schedule-primary{color:#c084fc}
.genie-chat-container.night-mode .inline-preference-btn{color:#c084fc; opacity: 0.8}
.genie-chat-container.night-mode .inline-preference-btn:hover{opacity: 1}
.genie-chat-container.night-mode .text :deep(.inline-preference-btn){color:#c084fc; opacity: 0.8}
.genie-chat-container.night-mode .text :deep(.inline-preference-btn:hover){opacity: 1}
.genie-chat-container.night-mode .recommendations,.genie-chat-container.night-mode .view-more-container{border-top:1px dashed #c084fc}
.genie-chat-container.night-mode .collapse-btn,.genie-chat-container.night-mode .collapse-btn-inline{color:#94a3b8;border:none;background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .collapse-btn:hover,.genie-chat-container.night-mode .collapse-btn-inline:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .default-avatar{color:#bfa76a;border:1px solid rgba(191,167,106,0.45)}
.genie-chat-container.night-mode .profile-btn .default-avatar{color:#94a3b8;border:none;background:transparent;box-shadow:none}
.genie-chat-container.night-mode .profile-btn-collapsed .default-avatar{background:rgba(255,255,255,0.08);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .sidebar .default-avatar svg{color:#94a3b8;stroke:#94a3b8}
.genie-chat-container.night-mode .recommendation-card,.genie-chat-container.night-mode .large-card{background:rgba(139,92,246,0.15);box-shadow:0 0 1px rgba(0,0,0,0.50),inset 0 0 0 0.7px rgba(255,255,255,0.05)}
.genie-chat-container.night-mode .chat-input-container{background:rgba(139,92,246,0.10);box-shadow:0 0 1px rgba(0,0,0,0.45),inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .rec-card-wrapper{background:transparent}
.genie-chat-container.night-mode .view-more-btn,.genie-chat-container.night-mode .image-request-btn{background:rgba(255,255,255,0.08);color:#c084fc;border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .view-more-btn:hover:not(:disabled),.genie-chat-container.night-mode .image-request-btn:hover:not(:disabled){background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .image-request-btn.loading{background:rgba(255,255,255,0.10);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.16)}
.genie-chat-container.night-mode .card-glow--verified .recommendation-card{background:rgba(34,197,94,0.15);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .card-glow--verified .rec-type{color:#22c556b1}
.genie-chat-container.night-mode .card-glow--verified .feedback-btn:hover{color:#22c556b1}
.genie-chat-container.night-mode .card-glow--verified .feedback-btn.active{color:#22c556b1}
.genie-chat-container.night-mode .card-glow--verified .feedback-btn.active svg{fill:#22c556b1;stroke:#22c556b1}
.genie-chat-container.night-mode .card-glow--verified .image-request-btn{color:#22c5567c;background:rgba(34,197,94,0.1);box-shadow:inset 0 0 0 1px rgba(34,197,94,0.09)}
.genie-chat-container.night-mode .card-glow--verified .image-request-btn:hover{background:rgba(34,197,94,0.2)!important;box-shadow:inset 0 0 0 1px rgba(34,197,94,0.1)!important}
.genie-chat-container.night-mode .card-glow--verified .text-action-btn.info-btn{background:rgba(34,197,94,0.3);box-shadow:inset 0 0 0 0.7px rgba(34,197,94,0.3)}
.genie-chat-container.night-mode .card-glow--verified .text-action-btn.info-btn:hover{background:rgba(34,197,94,0.35);box-shadow:inset 0 0 0 1px rgba(34,197,94,0.4)}
.genie-chat-container.night-mode .card-glow--spotlight .recommendation-card{background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .card-glow--spotlight .rec-type{color:#3b9fdda2}
.genie-chat-container.night-mode .card-glow--spotlight .feedback-btn:hover{color:#3b9fdda2}
.genie-chat-container.night-mode .card-glow--spotlight .feedback-btn.active{color:#3b9fdda2}
.genie-chat-container.night-mode .card-glow--spotlight .feedback-btn.active svg{fill:#3b9fdda2;stroke:#3b9fdda2}
.genie-chat-container.night-mode .card-glow--spotlight .image-request-btn{color:#3b9fdda2;background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 1px rgba(59,158,221,0.09)}
.genie-chat-container.night-mode .card-glow--spotlight .image-request-btn:hover{background:rgba(59,158,221,0.2)!important;box-shadow:inset 0 0 0 1px rgba(59,158,221,0.1)!important}
.genie-chat-container.night-mode .card-glow--spotlight .text-action-btn.info-btn{background:rgba(59,158,221,0.3);box-shadow:inset 0 0 0 0.7px rgba(59,158,221,0.3)}
.genie-chat-container.night-mode .card-glow--spotlight .text-action-btn.info-btn:hover{background:rgba(59,158,221,0.4);box-shadow:inset 0 0 0 1px rgba(59,158,221,0.4)}
.genie-chat-container.night-mode .card-glow--signature .recommendation-card{background:rgba(212,175,55,0.2);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .card-glow--signature .rec-type{color:#ffbf0085}
.genie-chat-container.night-mode .card-glow--signature .feedback-btn:hover{color:#ffbf0085}
.genie-chat-container.night-mode .card-glow--signature .feedback-btn.active{color:#ffbf0085}
.genie-chat-container.night-mode .card-glow--signature .feedback-btn.active svg{fill:#ffbf0085;stroke:#ffbf0085}
.genie-chat-container.night-mode .card-glow--signature .image-request-btn{color:#ffbf0085;background:rgba(212,175,55,0.1);box-shadow:inset 0 0 0 1px rgba(212,175,55,0.09)}
.genie-chat-container.night-mode .card-glow--signature .image-request-btn:hover{background:rgba(212,175,55,0.2)!important;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.1)!important}
.genie-chat-container.night-mode .card-glow--signature .text-action-btn.info-btn{background:rgba(212,175,55,0.3);box-shadow:inset 0 0 0 0.7px rgba(212,175,55,0.3)}
.genie-chat-container.night-mode .card-glow--signature .text-action-btn.info-btn:hover{background:rgba(212,175,55,0.4);box-shadow:inset 0 0 0 0.8px rgba(212,175,55,0.6)}
.genie-chat-container.night-mode .rec-image.loading-skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 100%)}
.genie-chat-container.night-mode .text-action-btn.info-btn{background:rgba(255,255,255,0.3);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .text-action-btn.info-btn:hover{background:rgba(255,255,255,0.35);color:#f1f5f9;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .text-action-btn.ask-btn{background:linear-gradient(45deg,rgba(212,175,55,0.6),rgba(255,140,0,0.6));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .text-action-btn.ask-btn:hover{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.2)}
.genie-chat-container.night-mode .loading-sessions,.genie-chat-container.night-mode .message-bubble.ai .content,.genie-chat-container.night-mode .message-bubble.ai .text,.genie-chat-container.night-mode .message-bubble.ai .content .text,.genie-chat-container.night-mode .session-title,.genie-chat-container.night-mode .current-session-title,.genie-chat-container.night-mode .greeting,.genie-chat-container.night-mode .large-card .rec-description,.genie-chat-container.night-mode .loading-more-text{color:#aeb8c7}
.genie-chat-container.night-mode .session-date,.genie-chat-container.night-mode .view-more-hint,.genie-chat-container.night-mode .ai-note{color:#94a3b8}
.genie-chat-container.night-mode .message-bubble.ai .text :deep(strong),.genie-chat-container.night-mode .message-bubble.ai .text :deep(a),.genie-chat-container.night-mode .message-bubble .text :deep(.section-header),.genie-chat-container.night-mode .message-bubble .text :deep(.destination-link){color:#c084fc}
.genie-chat-container.night-mode .text :deep(hr){border-top:1px solid #c084fc}
.genie-chat-container.night-mode .text :deep(blockquote){border-left-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.05)}
.genie-chat-container.night-mode .message-bubble.user .content{background:linear-gradient(45deg,rgba(59,130,246,0.25),rgba(99,102,241,0.15));backdrop-filter:blur(2px) saturate(160%);-webkit-backdrop-filter:blur(2px) saturate(160%);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .input-wrapper{background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .input-wrapper:focus-within{background:rgba(255,255,255,0.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .input-wrapper textarea{color:#d5dce4}
.genie-chat-container.night-mode .input-wrapper textarea::placeholder{color:rgba(226,232,240,0.5)}
.genie-chat-container.night-mode .session-item.active{background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(168,85,247,0.15));color:#e2e8f0;position:relative}
.genie-chat-container.night-mode .session-item.active::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);transition:left 0.5s ease}
.genie-chat-container.night-mode .session-item.active:hover{background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(168,85,247,0.15))}
.genie-chat-container.night-mode .session-item:hover{background:rgba(255,255,255,0.03)}
.genie-chat-container.night-mode .session-actions .icon-btn{color:#94a3b8}
.genie-chat-container.night-mode .session-actions .icon-btn:hover{color:#c084fc}
.genie-chat-container.night-mode .session-act-btn{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .session-act-btn:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .session-act-btn--del{color:#ff8585}
.genie-chat-container.night-mode .session-act-btn--del:hover{background:rgba(255,107,107,0.18)}
.genie-chat-container.night-mode .context-menu{background:transparent}
.genie-chat-container.night-mode .context-menu button{color:white}
.genie-chat-container.night-mode .context-menu button:hover{background:rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .context-menu button.delete-btn{color:#ff6b6b}
.genie-chat-container.night-mode .profile-btn{color:#94a3b8;background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .profile-btn:hover{background:rgba(255,255,255,0.08);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .switch-mode-btn{background:rgba(255,255,255,0.06);color:#94a3b8;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .switch-mode-btn:hover{background:rgba(255,255,255,0.08);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .profile-btn.profile-btn-collapsed{background:none;box-shadow:none}
.genie-chat-container.night-mode .profile-btn-collapsed:hover .default-avatar{background:rgba(255,255,255,0.16);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .action-chip{background:rgba(255,255,255,0.06);color:#94a3b8;border:none;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .action-chip:hover:not(:disabled){background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
/* Selected chip — same glacier glass, just brighter: stronger fill + brighter
   HAIRLINE ring (no 2px currentColor border — it broke the glass language). */
.genie-chat-container.night-mode .action-chip.chip-on{background:rgba(255,255,255,0.17);color:#e2e8f0;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.3)}
.genie-chat-container.night-mode .action-chip.chip-on:hover:not(:disabled){background:rgba(255,255,255,0.21);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.34)}
.genie-chat-container.night-mode .mode-toggle,.genie-chat-container.night-mode .mobile-mode-toggle{background:#6d28d9;color:white;box-shadow:0 0 4px rgba(168,85,247,0.4)}
.genie-chat-container.night-mode .mode-toggle:hover,.genie-chat-container.night-mode .mobile-mode-toggle:hover{box-shadow:0 0 10px rgba(168,85,247,0.4)}
.genie-chat-container.night-mode .mode-toggle-inline{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .mode-toggle-inline.with-text{background:rgba(255,255,255,0.06)}
.genie-chat-container.night-mode .mode-toggle-inline:hover:not(.disabled-cooldown){background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .mode-toggle-inline.with-text .mode-label{color:#d5dce4}
.genie-chat-container.night-mode .mode-toggle-inline.mode-nearby{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .mobile-toggle-inline{color:#d5dce4;background:transparent;box-shadow:none}
.genie-chat-container.night-mode .mobile-toggle-inline:hover:not(.disabled-cooldown){background:transparent;color:#c084fc;box-shadow:none}
.genie-chat-container.night-mode .mobile-actions-popover{background:rgba(30,26,48,0.55);box-shadow:0 0 10px rgba(0,0,0,0.3),inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .popover-action-btn{color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.07)}
.genie-chat-container.night-mode .popover-action-btn:last-child{border-bottom:none}
.genie-chat-container.night-mode .popover-action-btn:not(.action-disabled):not(.disabled-cooldown):hover{background:rgba(255,255,255,0.12)}
.genie-chat-container.night-mode .mobile-nav .mobile-menu-btn,.genie-chat-container.night-mode .mobile-new-chat .mobile-menu-btn{color:#94a3b8;background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1);backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.genie-chat-container.night-mode .mobile-nav .mobile-menu-btn:hover,.genie-chat-container.night-mode .mobile-new-chat .mobile-menu-btn:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .mobile-nav .mobile-menu-btn:active,.genie-chat-container.night-mode .mobile-new-chat .mobile-menu-btn:active{transform:scale(0.92)}
.genie-chat-container.night-mode .greeting-icon{filter:drop-shadow(0 0 8px rgba(65,105,225,0.7))}
.genie-chat-container.night-mode .skeleton-shimmer{color:rgba(255,255,255,0.3)}
.genie-chat-container.night-mode .profile-menu{background:rgba(30,26,48,0.38);box-shadow:0 0 1px rgba(0,0,0,0.2),inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .profile-menu-item{color:#94a3b8;border-bottom-color:rgba(139,92,246,0.1)}
.genie-chat-container.night-mode .profile-menu-item:hover{background:rgba(139,92,246,0.15)}
.genie-chat-container.night-mode .profile-menu-item.logout-item{color:#ff6b6b}
.genie-chat-container.night-mode .profile-menu-item.logout-item:hover{background:rgba(255,107,107,0.1)}
/* send-button glacier – night */
.genie-chat-container.night-mode .send-button{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .send-button:hover:not(.disabled-cooldown){background:rgba(255,255,255,0.14);color:#c084fc;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .new-chat-btn{background:rgba(255,255,255,0.06);color:#94a3b8;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .new-chat-btn:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .new-chat-btn-collapsed{background:rgba(255,255,255,0.06);color:#94a3b8;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.genie-chat-container.night-mode .new-chat-btn-collapsed:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.profile-modal .modal-content.night{background:rgba(40,30,62,0.62);color:#aab6c9;backdrop-filter:blur(30px) saturate(190%);-webkit-backdrop-filter:blur(30px) saturate(190%);box-shadow:inset 0 0 0 1px rgba(167,139,250,0.12),0 0 40px rgba(0,0,0,0.4)}
.profile-modal .modal-content.night .modal-header h3{color:#d4af37}
.profile-modal .modal-content.night .modal-header h4{color:#d4af37 !important}
.profile-modal .modal-content.night .profile-details p{color:#A0AEC0}
.profile-modal .modal-content.night .profile-preferences{border-top:none}
.profile-modal .modal-content.night .preference-item{border-bottom:1px solid rgba(255,255,255,0.07)}
.profile-modal .modal-content.night .preference-item:last-child{border-bottom:none}
.profile-modal .modal-content.night .preference-value{color:#aeb9cb}
.profile-modal .modal-content.night .close-btn{background:rgba(255,255,255,0.08);color:#cbd5e1;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04)}
.profile-modal .modal-content.night .close-btn:hover{background:rgba(255,255,255,0.18)}
.profile-modal .modal-content.night .pref-ic{color:#aeb9cb}
.profile-modal .modal-content.night .interest-tag{color:#aeb9cb}
.profile-modal .modal-content.night .avatar-container{background:rgba(255,255,255,0.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03),inset 0 0 6px rgba(255,255,255,0.04)}
.profile-modal .modal-content.night .profile-avatar.default-avatar{background:transparent;color:#aeb9cb}
.profile-modal .modal-content.night .edit-prefs-btn{color:#aeb9cb}
.profile-modal .modal-content.night .profile-details h4{color:#aeb9cb}
.profile-modal .modal-content.night .profile-details p{color:#8d99af}
.profile-modal .modal-content.night .preference-item>span:first-child{color:#aeb9cb}
.info-modal.night{background:rgba(30,20,56,0.85);color:#e2e8f0;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 0 5px rgba(0,0,0,0.5),inset 0 0 0 0.5px rgba(255,255,255,0.08)}
.info-modal.night .modal-header{border-bottom-color:#4a5568}
.info-modal.night .modal-header h3{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal.night .label,.info-modal.night .value,.info-modal.night .btn-secondary{color:#e2e8f0}
.info-modal.night .value a{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal.night .close-btn:hover{background:#2a1f4d}
.info-modal.night .btn-secondary{color:#d5dce4;background:rgba(255,255,255,0.06);border:none;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.info-modal.night .btn-secondary:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.info-modal.night .modal-actions{border-top-color:#4a5568}
.info-modal.night .loading-container p{color:#aaa}
/* ==================================================================================================== */
/*                                        DAY-MODE STYLES
/* ==================================================================================================== */
.genie-chat-container.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#f5edda 55%,#efe4cf 100%);color:#3c2a1e}
.genie-chat-container.day-mode .input-wrapper{background:rgba(255,255,255,0.5);color:#2d3748 !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .input-wrapper input,.genie-chat-container.day-mode .input-wrapper textarea{color:#3c2a1e}
.genie-chat-container.day-mode .input-wrapper input::placeholder,.genie-chat-container.day-mode .input-wrapper textarea::placeholder{color:rgba(92,74,66,0.7)}
.genie-chat-container.day-mode .input-wrapper textarea{color:#5c3f2e}
.genie-chat-container.day-mode .input-wrapper:focus-within{background:rgba(255,255,255,0.72);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.85)}
.genie-chat-container.day-mode .loading-more-text{color:rgba(92,74,66,0.7)}
.genie-chat-container.day-mode .inline-preference-btn{color:#B7791F; opacity: 0.8}
.genie-chat-container.day-mode .inline-preference-btn:hover{opacity: 1}
.genie-chat-container.day-mode .text :deep(.inline-preference-btn){color:#B7791F; opacity: 0.8}
.genie-chat-container.day-mode .text :deep(.inline-preference-btn:hover){opacity: 1}
.genie-chat-container.day-mode .mode-toggle.mode-discovery,.genie-chat-container.day-mode .mode-toggle.mode-nearby,.genie-chat-container.day-mode .mobile-mode-toggle.mode-discovery,.genie-chat-container.day-mode .mobile-mode-toggle.mode-nearby{background:linear-gradient(45deg,#8B4513,#A0522D);color:white}
.genie-chat-container.day-mode .mode-toggle.mode-discovery:hover,.genie-chat-container.day-mode .mode-toggle.mode-nearby:hover{box-shadow:0 0 8px rgba(139,69,19,0.7)}
.genie-chat-container.day-mode .fixed-header.with-shadow::after{background:transparent}
.genie-chat-container.day-mode .fixed-header.with-shadow{background:linear-gradient(to bottom,rgba(249,245,235,80) 0%,rgba(249,245,235,1) 0.01%,rgba(249,245,235,0) 100%)}
.genie-chat-container.day-mode .fixed-input-container:not(.empty-chat){background:linear-gradient(to top,rgba(239,228,207,1) 0%,rgba(239,228,207,1) 1%,rgba(239,228,207,0) 100%)}
.genie-chat-container.day-mode .view-more-btn{background:rgba(255,255,255,0.5);border:none;color:#A0522D;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .view-more-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .mode-toggle-inline{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .mode-toggle-inline.with-text{background:rgba(255,255,255,0.5)}
.genie-chat-container.day-mode .mode-toggle-inline:hover:not(.disabled-cooldown){background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .mode-toggle-inline.with-text .mode-label{color:#8b6b3d}
.genie-chat-container.day-mode .mode-toggle-inline.mode-nearby{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .mobile-toggle-inline{color:#8b6b3d;background:transparent;box-shadow:none}
.genie-chat-container.day-mode .mobile-toggle-inline:hover:not(.disabled-cooldown){background:transparent;color:#b8860b;box-shadow:none}
.genie-chat-container.day-mode .mobile-actions-popover{background:rgba(255,255,255,0.55);box-shadow:0 0 10px rgba(0,0,0,0.07),inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .popover-action-btn{color:#5c3f2e;border-bottom:1px solid rgba(0,0,0,0.06)}
.genie-chat-container.day-mode .popover-action-btn:last-child{border-bottom:none}
.genie-chat-container.day-mode .popover-action-btn:not(.action-disabled):not(.disabled-cooldown):hover{background:rgba(255,255,255,0.55)}
.genie-chat-container.day-mode .view-more-hint{color:rgba(92,74,66,0.8)}
.genie-chat-container.day-mode .greeting-icon{filter:drop-shadow(0 0 10px rgba(255,193,7,0.8))}
.genie-chat-container.day-mode .message-bubble.ai .content,.genie-chat-container.day-mode .message-bubble.ai .text,.genie-chat-container.day-mode .message-bubble.ai .content .text{color:#3c2a1e}
.genie-chat-container.day-mode .message-bubble.ai .text :deep(.section-header),.genie-chat-container.day-mode .message-bubble.ai .text :deep(.destination-link){color:#A0522D}
.genie-chat-container.day-mode .message-bubble.ai .text :deep(strong),.genie-chat-container.day-mode .message-bubble.ai .text :deep(a){color:#A0522D}
.genie-chat-container.day-mode .message-bubble.ai .content>div[style*="color: red"]{color:#8B0000}
.genie-chat-container.day-mode .text :deep(hr){border-top:1px solid #A0522D}
.genie-chat-container.day-mode .text :deep(blockquote){border-left-color:rgba(0,0,0,0.2);background:rgba(0,0,0,0.03)}
/* User bubble, day. Same sand tone as before — rgb(249,229,200) — but now
   actually glass, on the .text-action-btn.info-btn recipe (founder 2026-09-04:
   "something like more button in recommendation card, simply having the color
   tone it has currently").

   What was wrong: the fill was opaque rgb(), so the backdrop-filter had nothing
   to see through and rendered no glass at all while still costing a compositing
   layer; and the inset ring was painted in rgb(249,229,200) — the SAME colour as
   the fill — so the border was mathematically present and visually absent. That
   is the missing edge.

   Now: the sand carries alpha so the parchment reads through it and the blur has
   something to work on, the rim is white like every other glass surface here
   (.chat-input-container uses rgba(255,255,255,0.7)), and a soft warm-brown drop
   lifts the bubble off the page. Perceived colour is unchanged — 0.82 sand over
   #f5edda parchment lands within a shade of the old opaque value. */
/* User bubble, day — glass built from LIGHT, not from blur.

   Why the blur approach failed (founder 2026-09-04: "it is looking not glacier
   like, it is same just having white borders"): backdrop-filter blurs what is
   BEHIND an element, and behind this bubble there is nothing. .chat-messages is
   transparent, so the bubble sits straight on the day container's smooth
   linear-gradient — and blurring a smooth gradient returns the same smooth
   gradient. The composer reads as glass because messages scroll under it; the
   More pill reads as glass because it sits on a photo. This bubble has no
   detail to refract, so no amount of blur can ever make it glassy.

   So the glass is drawn instead, as three stacked background layers modelling a
   slab lit from above — no pseudo-element, because backgrounds always paint
   below the text whereas an ::after would wash it out:
     1. top sheen   — light pooling on the upper surface, gone by 62%
     2. diagonal    — bright top-left falling to a deeper sand bottom-right, so
                      the face is never a flat colour, which is the giveaway
     3. tinted base — the original rgb(249,229,200), now carrying alpha
   Then the box-shadow does the edges: a bright specular catch on the top rim, a
   softer full rim, an inner bottom shade that reads as the slab's thickness, and
   a cast shadow lifting it off the parchment.

   The backdrop-filter stays but is mostly saturate: blur is near-pointless here,
   while saturating the parchment behind a translucent fill genuinely warms it.

   Re-cut 2026-09-04 to the iOS material ("too bright, the colors are not
   matching" -> "something iphone usually uses, some glacier like").

   The earlier version was wrong twice. Too bright: the sheen and the diagonal
   each started near half-white, so stacked they hit ~0.75 white at the top-left
   and bleached the sand. Colours clashing: the diagonal ended on
   rgb(223,190,140), a browner tan than the fill, so the bubble drifted HUE from
   top to bottom rather than just value.

   Both came from the same mistake — dramatising the INSIDE. Apple's glass is
   nearly flat inside; its character is at the edges. So the internal gradient is
   now a single 0.14 veil, and the work moved to:
     - a 0.5px hairline rim, brightest along the top edge where light lands
     - a hairline of warm shade on the bottom edge, for thickness
     - a wide, soft, low-opacity drop shadow with NO offset. Arsen prefers a
       shadow even on every side over one pooling below or to the right
       (2026-09-04), so it is `0 0 18px -2px`, not `0 7px 20px -6px`. The
       negative spread keeps it from blooming now that nothing is directional.
     - blur 24px + saturate 180%: vibrancy is the other half of the material,
       and while the blur does little over a flat gradient it costs nothing and
       is correct the moment a card or image scrolls behind the bubble
   Fill alpha dropped to 0.70 so this is a VEIL over the parchment rather than a
   sand-coloured block — that translucency is what reads as Apple glass, and it
   lowers contrast against the page rather than raising it. */
.genie-chat-container.day-mode .message-bubble.user .content{background:linear-gradient(to bottom,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0) 55%),rgba(250,232,206,0.70);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:inset 0 0.5px 0 rgba(255,255,255,0.9),inset 0 0 0 0.5px rgba(255,255,255,0.45),inset 0 -0.5px 0 rgba(150,105,45,0.10),0 0 18px -2px rgba(139,69,19,0.12),0 0 4px rgba(139,69,19,0.05);color:#3c2a1e}
.genie-chat-container.day-mode .text-action-btn.info-btn{background:rgba(255,255,255,0.3);color:white;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .text-action-btn.info-btn:hover{background:rgba(255,255,255,0.4);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .text-action-btn.ask-btn{background:linear-gradient(45deg,rgba(212,175,55,0.5),rgba(255,140,0,0.5));color:white;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.35)}
.genie-chat-container.day-mode .text-action-btn.ask-btn:hover{background:linear-gradient(45deg,rgba(212,175,55,0.72),rgba(255,140,0,0.72));box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.4)}
.genie-chat-container.day-mode .rec-type{color:#A0522D}
.genie-chat-container.day-mode .rec-event-icon,.genie-chat-container.day-mode .rec-event-schedule-primary{color:#b87333}
.genie-chat-container.day-mode .recommendations,.genie-chat-container.day-mode .view-more-container{border-top:1px dashed #A0522D}
.genie-chat-container.day-mode .ai-note{color:#5c3f2e}
.genie-chat-container.day-mode .action-chip{background:rgba(255,255,255,0.5);border:none;color:rgba(92,74,66,0.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .action-chip:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
/* Selected chip — brighter warm glass, hairline ring only (see night-mode note). */
.genie-chat-container.day-mode .action-chip.chip-on{background:rgba(255,255,255,0.88);color:rgba(92,74,66,1);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95)}
.genie-chat-container.day-mode .action-chip.chip-on:hover{background:rgba(255,255,255,0.95)}
.genie-chat-container.day-mode .profile-btn{background:rgba(255,255,255,0.45);border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);color:#8b6b3d}
.genie-chat-container.day-mode .profile-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .switch-mode-btn{background:rgba(255,255,255,0.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);color:#8b6b3d}
.genie-chat-container.day-mode .switch-mode-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .profile-btn-collapsed:hover .default-avatar{background:rgba(255,255,255,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95)}
.genie-chat-container.day-mode .sidebar{background:linear-gradient(180deg,#f9f5eb 0%,#f5edda 55%,#efe4cf 100%)}
.genie-chat-container.day-mode .sidebar .default-avatar svg{color:#8b6b3d;stroke:#8b6b3d}
.genie-chat-container.day-mode .profile-btn .default-avatar{color:#8b6b3d;border:none;background:transparent;box-shadow:none}
.genie-chat-container.day-mode .profile-btn-collapsed .default-avatar{background:rgba(255,255,255,0.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .sidebar .collapse-btn,.genie-chat-container.day-mode .sidebar .collapse-btn-inline{color:#8b6b3d;border:none;background:rgba(255,255,255,0.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .sidebar .collapse-btn:hover,.genie-chat-container.day-mode .sidebar .collapse-btn-inline:hover,.genie-chat-container.day-mode .sidebar .mobile-menu-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9);color:#8b6b3d}
.genie-chat-container.day-mode .sidebar .collapse-btn:hover svg,.genie-chat-container.day-mode .sidebar .collapse-btn-inline:hover svg,.genie-chat-container.day-mode .sidebar .collapse-btn:hover.icon-btn:hover,.genie-chat-container.day-mode .sidebar .collapse-btn-inline:hover.icon-btn:hover{color:#8b6b3d;stroke:#8b6b3d}
.genie-chat-container.day-mode .sidebar .mobile-menu-btn:hover{background:rgba(216,193,161,0.85)}
.genie-chat-container.day-mode .loading-sessions{color:#5a4a42}
.genie-chat-container.day-mode .chat-input-container{background:rgba(255,253,248,0.62);box-shadow:0 0 10px rgba(139,69,19,0.06),inset 0 0 0 1px rgba(255,255,255,0.7)}
.genie-chat-container.day-mode .chat-messages,.genie-chat-container.day-mode .main-chat-area{background:transparent}
.genie-chat-container.day-mode .session-item.active{background:linear-gradient(135deg,rgba(184,115,51,0.35),rgba(205,133,63,0.2));color:#4a3c2e;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .session-item.active::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);transition:left 0.5s ease}
.genie-chat-container.day-mode .session-item.active:hover{background:linear-gradient(135deg,rgba(184,115,51,0.35),rgba(205,133,63,0.2));box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .session-item:hover{background:rgba(255,255,255,0.5);backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .session-actions .icon-btn{color:#6d5c47}
.genie-chat-container.day-mode .session-act-btn{background:rgba(255,255,255,0.6);color:#6d5c47;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.genie-chat-container.day-mode .session-act-btn:hover{background:rgba(255,255,255,0.9);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95)}
.genie-chat-container.day-mode .session-act-btn--del{color:#e05656}
.genie-chat-container.day-mode .session-act-btn--del:hover{background:rgba(224,86,86,0.12)}
.genie-chat-container.day-mode .session-actions .icon-btn:hover{color:black}
.genie-chat-container.day-mode .recommendation-card{background:rgba(255,255,255,0.5);box-shadow:0 0 10px rgba(139,69,19,0.05),inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .rec-card-wrapper{background:transparent}
.genie-chat-container.day-mode .card-glow--verified .recommendation-card{background:rgba(34,197,94,0.15);box-shadow:inset 0 0 0 0.7px rgba(34,197,94,0.2)}
.genie-chat-container.day-mode .card-glow--verified .rec-type{color:#22c556ea}
.genie-chat-container.day-mode .card-glow--verified .feedback-btn:hover{color:#22c556ea}
.genie-chat-container.day-mode .card-glow--verified .feedback-btn.active{color:#22c556ea}
.genie-chat-container.day-mode .card-glow--verified .feedback-btn.active svg{fill:#22c556ea;stroke:#22c556ea}
.genie-chat-container.day-mode .card-glow--verified .image-request-btn{color:#22c556ea;background:rgba(34,197,94,0.1);box-shadow:inset 0 0 0 1.5px rgba(34,197,94,0.3)}
.genie-chat-container.day-mode .card-glow--verified .image-request-btn:hover{background:rgba(34,197,94,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(34,197,94,0.2)!important}
.genie-chat-container.day-mode .card-glow--verified .text-action-btn.info-btn{background:rgba(34,197,94,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(34,197,94,0.3)}
.genie-chat-container.day-mode .card-glow--verified .text-action-btn.info-btn:hover{background:rgba(34,197,94,0.45);box-shadow:inset 0 0 0 0.8px rgba(34,197,94,0.6)}
.genie-chat-container.day-mode .card-glow--spotlight .recommendation-card{background:rgba(59,158,221,0.2);box-shadow:inset 0 0 0 0.7px rgba(59,158,221,0.2)}
.genie-chat-container.day-mode .card-glow--spotlight .rec-type{color:#3b9fdda2}
.genie-chat-container.day-mode .card-glow--spotlight .feedback-btn:hover{color:#3b9fdda2}
.genie-chat-container.day-mode .card-glow--spotlight .feedback-btn.active{color:#3b9fdda2}
.genie-chat-container.day-mode .card-glow--spotlight .feedback-btn.active svg{fill:#3b9fdda2;stroke:#3b9fdda2}
.genie-chat-container.day-mode .card-glow--spotlight .image-request-btn{color:#3b9fdda2;background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 1.5px rgba(59,158,221,0.3)}
.genie-chat-container.day-mode .card-glow--spotlight .image-request-btn:hover{background:rgba(59,158,221,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(59,158,221,0.2)!important}
.genie-chat-container.day-mode .card-glow--spotlight .text-action-btn.info-btn{background:rgba(59,158,221,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(59,158,221,0.3)}
.genie-chat-container.day-mode .card-glow--spotlight .text-action-btn.info-btn:hover{background:rgba(59,158,221,0.45);box-shadow:inset 0 0 0 0.8px rgba(59,158,221,0.6)}
.genie-chat-container.day-mode .card-glow--signature .recommendation-card{background:rgba(212,175,55,0.2);box-shadow:inset 0 0 0 0.7px rgba(212,175,55,0.2)}
.genie-chat-container.day-mode .card-glow--signature .rec-type{color:#d39510}
.genie-chat-container.day-mode .card-glow--signature .feedback-btn:hover{color:#d39510}
.genie-chat-container.day-mode .card-glow--signature .feedback-btn.active{color:#d39510}
.genie-chat-container.day-mode .card-glow--signature .feedback-btn.active svg{fill:#d39510;stroke:#d39510}
.genie-chat-container.day-mode .card-glow--signature .image-request-btn{color:#d39510;background:rgba(212,175,55,0.1);box-shadow:inset 0 0 0 1.5px rgba(212,175,55,0.3)}
.genie-chat-container.day-mode .card-glow--signature .image-request-btn:hover{background:rgba(212,175,55,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(212,175,55,0.2)!important}
.genie-chat-container.day-mode .card-glow--signature .text-action-btn.info-btn{background:rgba(212,175,55,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(212,175,55,0.3)}
.genie-chat-container.day-mode .card-glow--signature .text-action-btn.info-btn:hover{background:rgba(212,175,55,0.45);box-shadow:inset 0 0 0 0.8px rgba(212,175,55,0.6)}
.genie-chat-container.day-mode .current-session-title{color:#5c3f2e}
.genie-chat-container.day-mode .session-title,.genie-chat-container.day-mode .session-date{color:#5a4a42}
.genie-chat-container.day-mode .context-menu{background:rgba(255,255,255,0.95)}
.genie-chat-container.day-mode .context-menu button{color:#3c2a1e}
.genie-chat-container.day-mode .context-menu button:hover{background:rgba(212,175,55,0.1)}
.genie-chat-container.day-mode .context-menu button.delete-btn{color:#e53e3e}
.genie-chat-container.day-mode .mobile-nav .mobile-menu-btn,.genie-chat-container.day-mode .mobile-new-chat .mobile-menu-btn{color:#5a4a42;background:rgba(255,255,255,0.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.genie-chat-container.day-mode .mobile-nav .mobile-menu-btn:hover,.genie-chat-container.day-mode .mobile-new-chat .mobile-menu-btn:hover{background:rgba(255,255,255,0.78);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .mobile-nav .mobile-menu-btn:active,.genie-chat-container.day-mode .mobile-new-chat .mobile-menu-btn:active{transform:scale(0.92)}
.genie-chat-container.day-mode .mobile-nav .mobile-menu-btn svg,.genie-chat-container.day-mode .mobile-new-chat .mobile-menu-btn svg{stroke:#8b6b3d;fill:none;color:#8b6b3d}
.genie-chat-container.day-mode .section-title,.genie-chat-container.day-mode .results-count{color:#A0522D}
.genie-chat-container.day-mode .rec-image.loading-skeleton{background:linear-gradient(90deg,rgba(160,82,45,0.1) 0%,rgba(160,82,45,0.2) 50%,rgba(160,82,45,0.1) 100%)}
.genie-chat-container.day-mode .skeleton-shimmer{color:rgba(160,82,45,0.3)}
.genie-chat-container.day-mode .large-card{background:rgba(255,255,255,0.5);box-shadow:0 2px 10px rgba(139,69,19,0.05),inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .large-card .rec-description{color:#5a4a42}
.genie-chat-container.day-mode .image-request-btn{background:rgba(255,255,255,0.5);color:#A0522D;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .image-request-btn:hover:not(:disabled){background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .image-request-btn.loading{background:rgba(255,255,255,0.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.genie-chat-container.day-mode .profile-menu{background:rgba(255,255,255,0.5);box-shadow:0 0 1px rgba(0,0,0,0.1),inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .profile-menu-item{color:#3c2a1e;border-bottom-color:rgba(212,175,55,0.1)}
.genie-chat-container.day-mode .profile-menu-item:hover{background:rgba(212,175,55,0.1)}
.genie-chat-container.day-mode .profile-menu-item.logout-item{color:#e53e3e}
.genie-chat-container.day-mode .profile-menu-item.logout-item:hover{background:rgba(229,62,62,0.08)}
/* send-button glacier – day */
.genie-chat-container.day-mode .send-button{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .send-button:hover:not(.disabled-cooldown){background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .new-chat-btn{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .new-chat-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.genie-chat-container.day-mode .new-chat-btn-collapsed{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.genie-chat-container.day-mode .new-chat-btn-collapsed:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.profile-modal .modal-content.day{background:rgba(255,251,245,0.74);color:#2D3748;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);border:none;box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.45)}
.profile-modal .modal-content.day .modal-header h3{color:#B7791F}
.profile-modal .modal-content.day .profile-details h4{color:#B7791F}
.profile-modal .modal-content.day .profile-details p{color:#718096}
.profile-modal .modal-content.day .preference-item{border-bottom:1px solid rgba(0,0,0,0.06)}
.profile-modal .modal-content.day .preference-item>span:first-child{color:#975A16}
.profile-modal .modal-content.day .preference-item:last-child{border-bottom:none}
.profile-modal .modal-content.day .preference-value{color:#4A5568}
.profile-modal .modal-content.day .close-btn{background:rgba(255,255,255,0.6);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.8)}
.profile-modal .modal-content.day .close-btn:hover{background:rgba(255,255,255,0.9)}
.profile-modal .modal-content.day .pref-ic{color:#b8860b}
.profile-modal .modal-content.day .interest-tag{color:#8B6914}
.profile-modal .modal-content.day .avatar-container{background:rgba(255,255,255,0.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.profile-modal .modal-content.day .profile-avatar.default-avatar{background:transparent;color:#b8860b}
.profile-modal .modal-content.day .edit-prefs-btn{background:rgba(255,255,255,0.5);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.profile-modal .modal-content.day .edit-prefs-btn:hover{background:rgba(255,255,255,0.65)}
.info-modal.day{background:rgba(255,255,255,0.85);color:#2d3748;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:none;box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.6)}
.info-modal.day .label{background:linear-gradient(0deg,#D4AF37,#FF8C00);-webkit-text-fill-color:transparent;background-clip:text}
.info-modal.day .value{color:#3c2a1e}
.info-modal.day .btn-secondary{color:#8b6b3d;background:rgba(255,255,255,0.5);border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.info-modal.day .btn-secondary:hover{color:#5a4a42;background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.info-modal.day .loading-container p{color:#2d3748}
.info-modal.day .highlight-tag{background:rgba(212,175,55,0.12);color:#8B6914}
/* ── Glacier place-details (Maps-style) ───────────────────────────────── */
.info-modal .place-details{gap:14px}
.pd-subtitle{font-size:0.82rem;opacity:0.6;margin-top:-2px;text-transform:capitalize}
.pd-rating{display:flex;align-items:center;gap:6px;font-size:1rem;font-weight:600}
.pd-star{width:16px;height:16px;flex-shrink:0;color:#f5b301}
.pd-rating-out{opacity:0.5;font-weight:400;margin-left:-3px}
.pd-rating .review-count{font-weight:400;opacity:0.6;margin-left:2px}
.pd-actions{display:flex;flex-wrap:wrap;gap:8px}
.pd-action{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:22px;font-size:0.85rem;font-weight:600;line-height:1;cursor:pointer;border:none;text-decoration:none;white-space:nowrap;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);transition:all 0.2s ease}
.pd-action svg{width:16px;height:16px;flex-shrink:0}
.pd-action:active{transform:scale(0.96)}
.pd-divider{height:1px;width:100%;margin:2px 0}
.pd-fact{display:flex;gap:12px;align-items:flex-start}
.pd-fact-ic{flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center}
.pd-fact-ic svg{width:17px;height:17px}
.pd-fact-body{flex:1;min-width:0;font-size:0.92rem;line-height:1.45}
.pd-fact-body a{text-decoration:none}
.pd-fact--desc .pd-fact-body{opacity:0.82;font-size:0.88rem}
.pd-fact .hours-list div{padding:2px 0}
.pd-chips{display:flex;flex-wrap:wrap;gap:6px}
/* night */
.info-modal.night .pd-action{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.info-modal.night .pd-action:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.info-modal.night .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7));color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.info-modal.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.2)}
.info-modal.night .pd-divider{background:rgba(255,255,255,0.08)}
.info-modal.night .pd-fact-ic{color:#c9b8ff}
.info-modal.night .pd-fact-body a{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
/* day */
.info-modal.day .pd-action{background:rgba(255,255,255,0.55);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.info-modal.day .pd-action:hover{background:rgba(255,255,255,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95)}
.info-modal.day .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8));color:#fff;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.4)}
.info-modal.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9));box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.45)}
.info-modal.day .pd-divider{background:rgba(150,100,40,0.14)}
.info-modal.day .pd-fact-ic{color:#b87a2a}
.info-modal.day .pd-fact-body a{color:#b8860b}
/* ── Glacier social links (frosted pill, brand-tinted icon) ───────────── */
.info-modal .social-link{padding:6px 12px;border-radius:20px;font-weight:600;gap:6px;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);transition:all 0.18s ease}
.info-modal .social-link svg{flex-shrink:0}
.info-modal .social-link--instagram svg{color:#e1306c}
.info-modal .social-link--facebook svg{color:#1877f2}
.info-modal .social-link--tripadvisor svg{color:#22a06b}
.info-modal.night .social-link{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.info-modal.night .social-link:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1);opacity:1}
.info-modal.day .social-link{background:rgba(255,255,255,0.55);color:#6b5840;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.info-modal.day .social-link:hover{background:rgba(255,255,255,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95);opacity:1}
/* ── Refined highlight chips (frosted accent + sparkle) ───────────────── */
.info-modal .highlight-tag{display:inline-flex;align-items:center;gap:5px;font-size: 0.71875rem;font-weight:600;padding:5px 11px;border-radius:20px;backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%)}
.info-modal.night .highlight-tag{background:rgba(192,132,252,0.12);color:#e7defb;box-shadow:inset 0 0 0 0.8px rgba(192,132,252,0.22)}
.info-modal.day .highlight-tag{background:rgba(212,175,55,0.14);color:#7a5f1e;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.28)}
/* ── Highlights showcase panel ────────────────────────────────────────── */
.pd-highlights{border-radius:16px;padding:12px 14px 13px;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.pd-highlights-head{display:flex;align-items:center;gap:6px;font-size:0.7rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;opacity:0.7;margin-bottom:10px}
.pd-highlights-head {width:12px;height:12px}
.info-modal.night .pd-highlights{background:rgba(255,255,255,0.04);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.08)}
.info-modal.day .pd-highlights{background:rgba(255,255,255,0.4);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.pd-highlights-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 16px}
.pd-highlight-item{display:flex;align-items:flex-start;gap:9px;font-size:0.9rem;line-height:1.35;font-weight:500}
.info-modal .pd-highlight-check{width:15px;height:15px;margin-top:1px}
/* ── Hours schedule (day left, time right) ───────────────────────────── */
.pd-hours{display:flex;flex-direction:column;width:100%}
.pd-hours-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:6px 0}
.pd-hours-row:first-child{padding-top:0}
.pd-hours-row + .pd-hours-row{border-top:1px solid transparent}
.pd-hours-day{font-weight:600;white-space:nowrap}
.pd-hours-time{opacity:0.72;text-align:right;font-variant-numeric:tabular-nums}
.pd-hours-toggle{margin-top:7px;align-self:flex-start}
.info-modal.night .pd-hours-row + .pd-hours-row{border-top-color:rgba(255,255,255,0.08)}
.info-modal.day .pd-hours-row + .pd-hours-row{border-top-color:rgba(150,100,40,0.13)}
/* ── Tier tints: verified / spotlight / signature ─────────────────────── */
/* Only applied when the listing is a partner; background gets a subtle
   tier-colored sheen and accent elements (title, labels, fact icons,
   primary action, highlight chips) pick up the tier hue. The base modal
   box-shadow / inset highlight is preserved (only `background` is overridden). */

/* — VERIFIED (green) — */
.info-modal.night.info-modal--verified{background:linear-gradient(rgba(34,197,94,0.13),rgba(34,197,94,0.13)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--verified{background:linear-gradient(rgba(34,197,94,0.10),rgba(34,197,94,0.10)),rgba(255,255,255,0.85)}
.info-modal--verified.night .modal-header h3,.info-modal--verified.night .label{background:linear-gradient(45deg,#34d399,#22c55e);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--verified.day .modal-header h3,.info-modal--verified.day .label{background:linear-gradient(45deg,#16a34a,#15803d);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--verified.night .pd-fact-ic{color:#4ade80}
.info-modal--verified.day .pd-fact-ic{color:#16a34a}
.info-modal--verified.night .pd-action--primary{background:linear-gradient(45deg,rgba(34,197,94,0.7),rgba(16,185,129,0.7))}
.info-modal--verified.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8))}
.info-modal--verified.day .pd-action--primary{background:linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8))}
.info-modal--verified.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9))}
.info-modal--verified.night .highlight-tag{background:rgba(34,197,94,0.14);box-shadow:inset 0 0 0 0.8px rgba(34,197,94,0.3)}
.info-modal--verified.day .highlight-tag{background:rgba(34,197,94,0.13);color:#15803d;box-shadow:inset 0 0 0 1px rgba(34,197,94,0.32)}
.info-modal--verified .info-row--event{background:linear-gradient(135deg,rgba(34,197,94,0.16),rgba(16,185,129,0.07))}

/* — SPOTLIGHT (blue) — */
.info-modal.night.info-modal--spotlight{background:linear-gradient(rgba(59,158,221,0.15),rgba(59,158,221,0.15)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--spotlight{background:linear-gradient(rgba(59,158,221,0.11),rgba(59,158,221,0.11)),rgba(255,255,255,0.85)}
.info-modal--spotlight.night .modal-header h3,.info-modal--spotlight.night .label{background:linear-gradient(45deg,#5cb3e8,#3b9fdd);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--spotlight.day .modal-header h3,.info-modal--spotlight.day .label{background:linear-gradient(45deg,#2b85c0,#1f6ea8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--spotlight.night .pd-fact-ic{color:#5cb3e8}
.info-modal--spotlight.day .pd-fact-ic{color:#2b85c0}
.info-modal--spotlight.night .pd-action--primary{background:linear-gradient(45deg,rgba(59,158,221,0.7),rgba(37,128,190,0.7))}
.info-modal--spotlight.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8))}
.info-modal--spotlight.day .pd-action--primary{background:linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8))}
.info-modal--spotlight.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(59,158,221,0.9),rgba(37,128,190,0.9))}
.info-modal--spotlight.night .highlight-tag{background:rgba(59,158,221,0.14);box-shadow:inset 0 0 0 0.8px rgba(59,158,221,0.3)}
.info-modal--spotlight.day .highlight-tag{background:rgba(59,158,221,0.13);color:#1f6ea8;box-shadow:inset 0 0 0 1px rgba(59,158,221,0.32)}
.info-modal--spotlight .info-row--event{background:linear-gradient(135deg,rgba(59,158,221,0.16),rgba(37,128,190,0.07))}

/* — SIGNATURE (gold) — */
.info-modal.night.info-modal--signature{background:linear-gradient(rgba(212,175,55,0.15),rgba(212,175,55,0.15)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--signature{background:linear-gradient(rgba(212,175,55,0.13),rgba(212,175,55,0.13)),rgba(255,255,255,0.86)}
.info-modal--signature.night .pd-fact-ic{color:#e8c45f}
.info-modal--signature.day .pd-fact-ic{color:#c79a2e}
.info-modal--signature.night .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7))}
.info-modal--signature.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.82),rgba(255,140,0,0.82))}
.info-modal--signature.day .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8))}
.info-modal--signature.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9))}
.info-modal--signature.night .highlight-tag{background:rgba(212,175,55,0.18);box-shadow:inset 0 0 0 0.8px rgba(212,175,55,0.34)}
.info-modal--signature.day .highlight-tag{background:rgba(212,175,55,0.16);color:#7a5f1e;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.34)}
.info-modal--signature .info-row--event{background:linear-gradient(135deg,rgba(212,175,55,0.18),rgba(255,140,0,0.08))}
/* ==================================================================================================== */
/*                                        DESKTOP STYLES
/* ==================================================================================================== */
/* Desktop: the 800px column must NOT clip sideways — the lamp's serpent dust
   swings past its edges. .chat-messages never scrolls itself (all scroll code
   drives .scrollable-content), so its overflow and fade mask are vestigial
   here: overflow opens up, and the mask moves to the real (full-width)
   scroller, whose clip edge is the screen edge. Mobile keeps the base rules. */
@media (min-width:769px){.main-chat-area{max-width:800px;margin:0 auto;overflow:visible}.chat-header{max-width:800px;margin:0 auto;justify-content:center}.chat-messages{max-width:800px;margin:0 auto;width:100%;overflow:visible;-webkit-mask-image:none;mask-image:none}.scrollable-content{-webkit-mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.1) 6px,rgba(0,0,0,0.4) 13px,rgba(0,0,0,0.78) 19px,#000 26px,#000 calc(100% - 26px),rgba(0,0,0,0.78) calc(100% - 19px),rgba(0,0,0,0.4) calc(100% - 13px),rgba(0,0,0,0.1) calc(100% - 6px),transparent 100%)}.chat-input-container{margin:0}}
/* ==================================================================================================== */
/*                                        MOBILE STYLES
/* ==================================================================================================== */
@media (max-width:768px){.mobile-nav,.mobile-new-chat{z-index:1001 !important;position:relative}.app-header{padding:0 15px}.app-brand{gap:15px}.sidebar-header{padding:5px 16px 3px 16px}.sidebar:not(.sidebar-open){transform:translateX(-100%)}.sidebar.sidebar-open{transform:translateX(0)}.fullscreen-image{min-width:250px;min-height:150px}.rec-header{gap:8px}.image-request-btn{width:2.375rem;height:2.375rem}.image-request-btn svg{width:1.1875rem;height:1.1875rem}.fullscreen-nav-btn{width:50px;height:50px}.fullscreen-prev{left:15px}.fullscreen-next{right:15px}.fullscreen-close-btn{top:15px;right:15px;width:40px;height:40px;font-size:1.2rem}.fullscreen-counter{bottom:15px;padding:6px 12px;font-size:0.8rem}.mobile-actions-popover{right:35px}.ai-greeting{font-size:1rem;font-weight:130;padding:0 10px 10px 10px;gap:10px}.greeting{font-size:1.05rem}.ai-note{font-size:0.7rem;padding:0 10px}.input-wrapper textarea{padding:14px 50px 14px 15px}.edit-prefs-btn{padding:10px}.modal-header{padding:10px 12px!important}.profile-details h4{font-size:1.1rem}.modal-body{padding:8px 20px 20px 20px}.profile-info{padding:0 10px 0 16px!important}.recommendation-card.touch-active .image-overlay,.recommendation-card:active .image-overlay{opacity:1;visibility:visible;z-index:10}.recommendation-card.touch-active .rec-image-save-btn,.recommendation-card:active .rec-image-save-btn{opacity:0.55}.recommendation-card.touch-active .rec-image-save-btn.saved,.recommendation-card:active .rec-image-save-btn.saved{opacity:1}.recommendation-card.touch-active{transform:scale(0.98);transition:transform 0.1s ease}.overlay-actions{flex-direction:row;gap:8px}.text-action-btn{padding:10px 14px;border-radius:20px}.chat-input-container{max-height:none;overflow:visible}.chat-input-container,.chat-header{z-index:100;position:relative}.sidebar{height:100%;width:80vw;position:fixed;left:0;top:0;bottom:0;z-index:1000;overflow:hidden;transform:translateX(-100%);-webkit-overflow-scrolling:touch;overflow-y:auto}.chat-history{-webkit-overflow-scrolling:touch;padding:20px 10px 15px 10px}.mobile-mode-toggle{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:20px;border:none;cursor:pointer;transition:all 0.3s ease;flex:1;font-weight:600;font-size:0.9rem;min-width:130px;max-width:130px}.sidebar-overlay{z-index:999}.new-chat-btn{font-size:0.8rem}.chat-header{padding:env(safe-area-inset-top,0px) 15px 0;align-items:center;min-height:calc(56px + env(safe-area-inset-top,0px));justify-content:center;z-index:1001}.current-session-title{flex:1;font-size:1.2rem;margin:0 50px 0 50px}.mobile-nav{position:absolute;left:15px;top:calc(50% + env(safe-area-inset-top,0px) / 2);transform:translateY(-50%)}.context-menu{max-width:80vw}.context-menu button{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mobile-new-chat{position:absolute;right:15px;top:calc(50% + env(safe-area-inset-top,0px) / 2);transform:translateY(-50%)}.mobile-nav .mobile-menu-btn,.mobile-new-chat .mobile-menu-btn{background:transparent;border:none;font-size:1.2rem;font-weight:400;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s ease;font-family:inherit;line-height:1;padding:0;margin:0}.mobile-nav .mobile-menu-btn:focus,.mobile-new-chat .mobile-menu-btn:focus{outline-offset:2px}.mobile-menu-btn svg,.mobile-menu-btn::before,.mobile-menu-btn::after{display:block;margin:0 auto}}
@supports (-webkit-touch-callout:none){.genie-chat-container{position:fixed;width:100%;height:100%;overflow:hidden}.chat-messages{padding:74px 20px 108px 20px;overflow-y:scroll;-webkit-overflow-scrolling:touch;transform:translate3d(0,0,0)}}
@keyframes fadeIn{to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

/* ── Save/bookmark button on rec image (upper right corner) ──────────── */
.rec-image{position:relative}
.rec-image-save-btn{position:absolute;top:-6px;right:6px;width:24px;height:90px;border:none;border-radius:8px;background:transparent;cursor:pointer;display:flex;align-items:flex-start;justify-content:center;overflow:visible;color:#fff;z-index:15;flex-shrink:0;padding:0;opacity:0;transition:opacity 0.25s ease;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:opacity;backface-visibility:hidden;-webkit-backface-visibility:hidden}
/* Reveal on card hover. Stay visible when already saved so saved places show their bookmark at a glance. */
.recommendation-card:hover .rec-image-save-btn{opacity:0.85}
.rec-image-save-btn.saved,.recommendation-card:hover .rec-image-save-btn.saved{opacity:1}
.recommendation-card:hover .rec-image-save-btn:hover{opacity:1}
.rec-image-save-btn:not(.saved):hover svg{fill:rgba(255,255,255,0.55)}
.rec-image-save-btn.saved{color:#D4AF37}
/* No CSS fill override here: each saved-bookmark SVG carries its own inline
   fill="url(#...)" pointing at a gradient defined inside that same SVG, so it
   always resolves — in chat cards AND the saved panel, desktop and mobile.
   A global url(#saveGradient) rule broke the panel whenever no chat-card
   gradient happened to be in the DOM. */
.rec-image-save-btn:disabled{opacity:0.3;cursor:default;pointer-events:none}

/* ── Sidebar Saved Places button ─────────────────────────────────────── */
/* Saved Places — circular companion to the New Chat button. Same gradient
   family, lighter "secondary" weight so New Chat stays the primary action. */
.saved-places-nav-btn{width:40px;height:40px;flex-shrink:0;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:all 0.3s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.saved-places-nav-btn:active{transform:scale(0.92)}
.day-mode .saved-places-nav-btn{background:rgba(255,255,255,0.45);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.day-mode .saved-places-nav-btn:hover{background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9);color:#8b6b3d}
.night-mode .saved-places-nav-btn{background:rgba(255,255,255,0.06);color:#94a3b8;box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.night-mode .saved-places-nav-btn:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1);color:#cbd5e1}
.saved-places-nav-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}

/* ── Panel slide-in transition ───────────────────────────────────────── */
/* Backdrop fades; inner panel slides in from the right edge and back out to the right. */
.slide-panel-enter-active,.slide-panel-leave-active{transition:background-color 0.34s ease}
.slide-panel-enter-active .saved-panel,.slide-panel-leave-active .saved-panel{transition:transform 0.36s cubic-bezier(0.22,1,0.36,1)}
.slide-panel-enter-from,.slide-panel-leave-to{background-color:rgba(0,0,0,0)}
.slide-panel-enter-from .saved-panel,.slide-panel-leave-to .saved-panel{transform:translateX(100%)}
.saved-panel-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:stretch;justify-content:flex-end}
[data-theme="light"] .saved-panel-overlay{background:rgba(247,242,232,0.60)}
.saved-panel{width:min(440px,100vw);height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative}
.saved-panel.night{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);color:#e2e8f0}
.saved-panel.night .close-btn:hover{background:#2a1f4d}
.saved-panel.day{background:linear-gradient(180deg,#f9f5eb 0%,#f5edda 55%,#efe4cf 100%);color:#3c2a1e}
.saved-panel.day .close-btn:hover{background:#f9e5c8}

/* ── Panel header ──────────────────────────────────────────────────── */
/* Absolute transparent overlay (same pattern as .fixed-header): the list scrolls underneath and dissolves via the body's mask fade */
.saved-panel-header{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px 16px;background:transparent;pointer-events:none}
.saved-panel-header h3{display:flex;align-items:center;gap:8px;margin:0;font-size:1.1rem;font-weight:600;color:#D4AF37}
.saved-panel-header .close-btn{pointer-events:auto}
.night .saved-panel-header h3{color:#c084fc}
/* Glacier glass close button */
.saved-panel .close-btn{width:32px;height:32px;border-radius:10px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);transition:background 0.18s ease,transform 0.15s ease}
.saved-panel .close-btn svg{width:18px;height:18px}
.saved-panel .close-btn:active{transform:scale(0.9)}
.saved-panel.day .close-btn{background:rgba(255,255,255,0.55);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.75)}
.saved-panel.day .close-btn:hover{background:rgba(255,255,255,0.85)}
.saved-panel.night .close-btn{background:rgba(255,255,255,0.08);color:#cbd5e1;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.16)}
.saved-panel.night .close-btn:hover{background:rgba(255,255,255,0.18)}
.panel-close-btn{background:transparent;border:none;cursor:pointer;padding:4px;border-radius:6px;opacity:0.6;transition:opacity 0.2s;color:inherit}
.panel-close-btn:hover{opacity:1}
/* Saved panel bookmark-style save button */
.saved-panel-save-btn{position:absolute;top:-18px;right:0}
.saved-panel-body{flex:1;overflow-y:auto;padding:80px 20px 10px 20px;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;overscroll-behavior:contain;-webkit-mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.4) 22px,#000 58px);mask-image:linear-gradient(to bottom,transparent 0,rgba(0,0,0,0.4) 22px,#000 58px)}

/* ── Empty state ────────────────────────────────────────────────────── */
.saved-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:12px;opacity:0.5}
.saved-empty p{margin:0;font-size:1rem;font-weight:600}
.saved-empty span{font-size:0.85rem}

/* ── Saved cards ────────────────────────────────────────────────────── */
.saved-grid{display:flex;flex-direction:column;gap:12px}
.saved-card{display:flex;gap:0;border-radius:12px;overflow:hidden;border:none;transition:box-shadow 0.2s}
.night .saved-card{background:rgba(139,92,246,0.07)}
.day .saved-card{background:rgba(255,255,255,0.8)}
.saved-card-image{width:200px;min-width:200px;height:140px;position:relative;background:rgba(0,0,0,0.08);overflow:hidden}
.saved-card-image img{width:100%;height:100%;object-fit:cover;display:block}
.saved-card-image-placeholder{width:100%;display:flex;align-items:center;justify-content:center;opacity:0.3}
.unsave-btn{position:absolute;top:-18px;right:0;width:36px;height:120px;border:none;border-radius:0;background:transparent;cursor:pointer;display:flex;align-items:flex-start;justify-content:center;overflow:visible;color:#D4AF37;z-index:15;flex-shrink:0;padding:0;transition:opacity 0.2s,transform 0.15s}
.unsave-btn:hover{opacity:0.8}
.unsave-btn:active{transform:scale(0.85)}
.saved-card-details{flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:3px;min-width:0}
.saved-card-name{font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.saved-card-category{font-size:0.75rem;opacity:0.6;text-transform:capitalize}
/* Event row inside a saved-place card. The details column already has
   gap:3px, so cancel the row's own margin-top to avoid double spacing.
   The saved panel uses .day/.night theme classes (not .day-mode/
   .night-mode), so accent colors are set explicitly here. */
.saved-card-event{margin-top:0}
.saved-panel.day .saved-card-event .rec-event-icon,
.saved-panel.day .saved-card-event .rec-event-schedule-primary{color:#b87333}
.saved-panel.night .saved-card-event .rec-event-icon,
.saved-panel.night .saved-card-event .rec-event-schedule-primary{color:#c084fc}
.saved-card-location{font-size:0.78rem;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.saved-card-rating{font-size:0.78rem;color:#D4AF37}
.night .saved-card-rating{color:#c084fc}
.saved-card-actions{display:flex;gap:6px;margin-top:auto;padding-top:6px}
.saved-action-btn{padding:4px 10px;border-radius:20px;background:transparent;font-size:0.75rem;cursor:pointer;transition:background 0.2s;color:inherit;text-decoration:none;display:inline-flex;align-items:center;border:none}
.saved-action-btn:hover{background:rgba(212,175,55,0.12)}
.saved-action-btn--primary{background:rgba(212,175,55,0.15)}
.saved-action-btn--primary:hover{background:rgba(212,175,55,0.25)}
.saved-action-btn:disabled{opacity:0.4;cursor:default;pointer-events:none}
.night .saved-action-btn:hover{background:rgba(139,92,246,0.15)}
.night .saved-action-btn--primary{background:rgba(139,92,246,0.18)}
.night .saved-action-btn--primary:hover{background:rgba(139,92,246,0.3)}

/* ── Loading skeletons ───────────────────────────────────────────────── */
.saved-loading{display:flex;flex-direction:column;gap:12px}
.saved-skeleton-card{display:flex;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.1)}
.night .saved-skeleton-card{border-color:rgba(139,92,246,0.1)}
.saved-skeleton-image{width:100px;min-width:100px;height:90px;background:linear-gradient(90deg,rgba(212,175,55,0.08) 0%,rgba(212,175,55,0.18) 50%,rgba(212,175,55,0.08) 100%);background-size:200% 100%;animation:shimmer 1.4s infinite}
.night .saved-skeleton-image{background:linear-gradient(90deg,rgba(139,92,246,0.08) 0%,rgba(139,92,246,0.18) 50%,rgba(139,92,246,0.08) 100%);background-size:200% 100%}
.saved-skeleton-lines{flex:1;padding:14px 12px;display:flex;flex-direction:column;gap:8px}
.saved-skeleton-line{height:12px;border-radius:6px;background:linear-gradient(90deg,rgba(212,175,55,0.08) 0%,rgba(212,175,55,0.18) 50%,rgba(212,175,55,0.08) 100%);background-size:200% 100%;animation:shimmer 1.4s infinite}
.night .saved-skeleton-line{background:linear-gradient(90deg,rgba(139,92,246,0.08) 0%,rgba(139,92,246,0.18) 50%,rgba(139,92,246,0.08) 100%);background-size:200% 100%}
.saved-skeleton-line.long{width:75%}
.saved-skeleton-line.short{width:45%}
/* ── Saved panel: same background & cards as the chat container ── */
.saved-panel.glacier.day{background:linear-gradient(180deg,rgba(249,245,235,0.74) 0%,rgba(245,237,218,0.70) 55%,rgba(239,228,207,0.74) 85%,#efe4cf 100%);color:#3c2a1e;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%)}
.saved-panel.glacier.night{background:linear-gradient(180deg,rgba(10,1,24,0.64) 0%,rgba(26,11,46,0.60) 40%,rgba(22,33,62,0.64) 85%,#16213e 100%);color:#c7cede;backdrop-filter:blur(30px) saturate(190%);-webkit-backdrop-filter:blur(30px) saturate(190%)}
/* Glacier glass inner edge (desktop) — light rim that replaces the removed drop-shadow; border-inline-start keeps it on the panel's open edge in both LTR and RTL */
@media (min-width:769px){
  [data-theme="light"] .saved-panel{border-inline-start:1px solid rgba(255,255,255,0.6)}
  [data-theme="dark"] .saved-panel{border-inline-start:1px solid rgba(255,255,255,0.14)}
}
/* "Saved Places" title — match the Jinni brand-name gradient (both themes) */
.saved-panel.glacier .saved-panel-header h3{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
/* Saved cards = the real recommendation cards, just stacked vertically.
   No appearance overrides → identical frosted look + native button colours. */
.saved-rec-list{display:flex;flex-direction:column}
.saved-rec-list .inline-recommendation-wrapper{margin:0 0 16px 0}
/* Uniform card height in the saved panel: short cards bump up to a shared baseline, taller ones still grow */
/* width:100% stops broken-image cards from shrinking to their text width (image normally defines card width) */
.saved-rec-list .rec-card-wrapper{width:100%}
.saved-rec-list .recommendation-card{min-height:230px;width:100%}
.saved-rec-list .rec-details{flex:1;display:flex;flex-direction:column}
.saved-rec-list .rec-metadata{margin-top:auto}
/* Failed/missing images: keep the image box at full height with a visible placeholder so the card doesn't shrink */
.saved-rec-list .rec-image{min-height:140px}
.saved-panel.night .rec-image:not(.loading-skeleton){background:rgba(255,255,255,0.06)}
.saved-panel.day .rec-image:not(.loading-skeleton){background:rgba(160,82,45,0.10)}
.saved-rec-list .rec-image::after{content:"";position:absolute;inset:0;z-index:0;opacity:0.28;pointer-events:none;background:center/38px no-repeat url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='1.4'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>")}
.saved-rec-list .rec-image img{position:relative;z-index:1}
.saved-rec-list .rec-image.loading-skeleton::after{display:none}
/* Neutralise the chat-only float/display:block leak so every saved card is a clean,
   uniform full-width flex column — fixes ragged card widths/heights while scrolling. */
.saved-panel .inline-recommendation-wrapper{display:block;width:100%;box-sizing:border-box}
.saved-panel .rec-card-wrapper{width:100%;box-sizing:border-box}
.saved-panel .recommendation-card{display:flex;flex-direction:column;float:none;width:100%;max-width:100%;box-sizing:border-box}
/* Always show the bookmark/unsave button in the saved panel — that's the point of
   the panel. Don't make it depend on hover / touch-active / the .saved class. */
.saved-panel .rec-image-save-btn{opacity:1}
/* ── Saved panel: mirror chat card colours (panel lives outside .genie-chat-container) ── */
.saved-panel.night .section-title,.saved-panel.night .results-count,.saved-panel.night .rec-type{color:#c084fc}
.saved-panel.night .rec-event-icon,.saved-panel.night .rec-event-schedule-primary{color:#c084fc}
.saved-panel.night .recommendation-card,.saved-panel.night .large-card{background:rgba(139,92,246,0.10);box-shadow:0 0 6px rgba(10,1,24,0.55),inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.saved-panel.night .rec-card-wrapper{background:transparent}
.saved-panel.night .view-more-btn,.saved-panel.night .image-request-btn{background:rgba(255,255,255,0.08);color:#c084fc;border:none;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.1)}
.saved-panel.night .view-more-btn:hover:not(:disabled),.saved-panel.night .image-request-btn:hover:not(:disabled){background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.1)}
.saved-panel.night .image-request-btn.loading{background:rgba(255,255,255,0.10);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.16)}
.saved-panel.night .card-glow--verified .recommendation-card{background:rgba(34,197,94,0.15);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.saved-panel.night .card-glow--verified .rec-type{color:#22c556b1}
.saved-panel.night .card-glow--verified .feedback-btn:hover{color:#22c556b1}
.saved-panel.night .card-glow--verified .feedback-btn.active{color:#22c556b1}
.saved-panel.night .card-glow--verified .feedback-btn.active svg{fill:#22c556b1;stroke:#22c556b1}
.saved-panel.night .card-glow--verified .image-request-btn{color:#22c5567c;background:rgba(34,197,94,0.1);box-shadow:inset 0 0 0 1px rgba(34,197,94,0.09)}
.saved-panel.night .card-glow--verified .image-request-btn:hover{background:rgba(34,197,94,0.2)!important;box-shadow:inset 0 0 0 1px rgba(34,197,94,0.1)!important}
.saved-panel.night .card-glow--verified .text-action-btn.info-btn{background:rgba(34,197,94,0.3);box-shadow:inset 0 0 0 0.7px rgba(34,197,94,0.3)}
.saved-panel.night .card-glow--verified .text-action-btn.info-btn:hover{background:rgba(34,197,94,0.35);box-shadow:inset 0 0 0 1px rgba(34,197,94,0.4)}
.saved-panel.night .card-glow--spotlight .recommendation-card{background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.saved-panel.night .card-glow--spotlight .rec-type{color:#3b9fdda2}
.saved-panel.night .card-glow--spotlight .feedback-btn:hover{color:#3b9fdda2}
.saved-panel.night .card-glow--spotlight .feedback-btn.active{color:#3b9fdda2}
.saved-panel.night .card-glow--spotlight .feedback-btn.active svg{fill:#3b9fdda2;stroke:#3b9fdda2}
.saved-panel.night .card-glow--spotlight .image-request-btn{color:#3b9fdda2;background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 1px rgba(59,158,221,0.09)}
.saved-panel.night .card-glow--spotlight .image-request-btn:hover{background:rgba(59,158,221,0.2)!important;box-shadow:inset 0 0 0 1px rgba(59,158,221,0.1)!important}
.saved-panel.night .card-glow--spotlight .text-action-btn.info-btn{background:rgba(59,158,221,0.3);box-shadow:inset 0 0 0 0.7px rgba(59,158,221,0.3)}
.saved-panel.night .card-glow--spotlight .text-action-btn.info-btn:hover{background:rgba(59,158,221,0.4);box-shadow:inset 0 0 0 1px rgba(59,158,221,0.4)}
.saved-panel.night .card-glow--signature .recommendation-card{background:rgba(212,175,55,0.2);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1)}
.saved-panel.night .card-glow--signature .rec-type{color:#ffbf0085}
.saved-panel.night .card-glow--signature .feedback-btn:hover{color:#ffbf0085}
.saved-panel.night .card-glow--signature .feedback-btn.active{color:#ffbf0085}
.saved-panel.night .card-glow--signature .feedback-btn.active svg{fill:#ffbf0085;stroke:#ffbf0085}
.saved-panel.night .card-glow--signature .image-request-btn{color:#ffbf0085;background:rgba(212,175,55,0.1);box-shadow:inset 0 0 0 1px rgba(212,175,55,0.09)}
.saved-panel.night .card-glow--signature .image-request-btn:hover{background:rgba(212,175,55,0.2)!important;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.1)!important}
.saved-panel.night .card-glow--signature .text-action-btn.info-btn{background:rgba(212,175,55,0.3);box-shadow:inset 0 0 0 0.7px rgba(212,175,55,0.3)}
.saved-panel.night .card-glow--signature .text-action-btn.info-btn:hover{background:rgba(212,175,55,0.4);box-shadow:inset 0 0 0 0.8px rgba(212,175,55,0.6)}
.saved-panel.night .rec-image.loading-skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 100%)}
.saved-panel.night .text-action-btn.info-btn{background:rgba(255,255,255,0.3);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.saved-panel.night .text-action-btn.info-btn:hover{background:rgba(255,255,255,0.35);color:#f1f5f9;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.1)}
.saved-panel.night .text-action-btn.ask-btn{background:linear-gradient(45deg,rgba(212,175,55,0.6),rgba(255,140,0,0.6));color:white;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.saved-panel.night .text-action-btn.ask-btn:hover{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.2)}
.saved-panel.night .loading-sessions,.saved-panel.night .message-bubble.ai .content,.saved-panel.night .message-bubble.ai .text,.saved-panel.night .message-bubble.ai .content .text,.saved-panel.night .session-title,.saved-panel.night .current-session-title,.saved-panel.night .greeting,.saved-panel.night .large-card .rec-description,.saved-panel.night .loading-more-text{color:#94a3b8}
.saved-panel.day .text-action-btn.info-btn{background:rgba(255,255,255,0.3);color:white;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.6)}
.saved-panel.day .text-action-btn.info-btn:hover{background:rgba(255,255,255,0.4);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.9)}
.saved-panel.day .text-action-btn.ask-btn{background:linear-gradient(45deg,rgba(212,175,55,0.5),rgba(255,140,0,0.5));color:white;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.35)}
.saved-panel.day .text-action-btn.ask-btn:hover{background:linear-gradient(45deg,rgba(212,175,55,0.72),rgba(255,140,0,0.72));box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.4)}
.saved-panel.day .rec-type{color:#A0522D}
.saved-panel.day .rec-event-icon,.saved-panel.day .rec-event-schedule-primary{color:#b87333}
.saved-panel.day .recommendation-card{background:rgba(255,255,255,0.5);box-shadow:0 0 6px rgba(139,69,19,0.10),inset 0 0 0 1px rgba(255,255,255,0.6)}
.saved-panel.day .rec-card-wrapper{background:transparent}
.saved-panel.day .card-glow--verified .recommendation-card{background:rgba(34,197,94,0.15);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.6)}
.saved-panel.day .card-glow--verified .rec-type{color:#22c556ea}
.saved-panel.day .card-glow--verified .feedback-btn:hover{color:#22c556ea}
.saved-panel.day .card-glow--verified .feedback-btn.active{color:#22c556ea}
.saved-panel.day .card-glow--verified .feedback-btn.active svg{fill:#22c556ea;stroke:#22c556ea}
.saved-panel.day .card-glow--verified .image-request-btn{color:#22c556ea;background:rgba(34,197,94,0.1);box-shadow:inset 0 0 0 1.5px rgba(34,197,94,0.3)}
.saved-panel.day .card-glow--verified .image-request-btn:hover{background:rgba(34,197,94,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(34,197,94,0.2)!important}
.saved-panel.day .card-glow--verified .text-action-btn.info-btn{background:rgba(34,197,94,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(34,197,94,0.3)}
.saved-panel.day .card-glow--verified .text-action-btn.info-btn:hover{background:rgba(34,197,94,0.45);box-shadow:inset 0 0 0 0.8px rgba(34,197,94,0.6)}
.saved-panel.day .card-glow--spotlight .recommendation-card{background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.6)}
.saved-panel.day .card-glow--spotlight .rec-type{color:#3b9fdda2}
.saved-panel.day .card-glow--spotlight .feedback-btn:hover{color:#3b9fdda2}
.saved-panel.day .card-glow--spotlight .feedback-btn.active{color:#3b9fdda2}
.saved-panel.day .card-glow--spotlight .feedback-btn.active svg{fill:#3b9fdda2;stroke:#3b9fdda2}
.saved-panel.day .card-glow--spotlight .image-request-btn{color:#3b9fdda2;background:rgba(59,158,221,0.1);box-shadow:inset 0 0 0 1.5px rgba(59,158,221,0.3)}
.saved-panel.day .card-glow--spotlight .image-request-btn:hover{background:rgba(59,158,221,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(59,158,221,0.2)!important}
.saved-panel.day .card-glow--spotlight .text-action-btn.info-btn{background:rgba(59,158,221,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(59,158,221,0.3)}
.saved-panel.day .card-glow--spotlight .text-action-btn.info-btn:hover{background:rgba(59,158,221,0.45);box-shadow:inset 0 0 0 0.8px rgba(59,158,221,0.6)}
.saved-panel.day .card-glow--signature .recommendation-card{background:rgba(212,175,55,0.2);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.6)}
.saved-panel.day .card-glow--signature .rec-type{color:#d39510}
.saved-panel.day .card-glow--signature .feedback-btn:hover{color:#d39510}
.saved-panel.day .card-glow--signature .feedback-btn.active{color:#d39510}
.saved-panel.day .card-glow--signature .feedback-btn.active svg{fill:#d39510;stroke:#d39510}
.saved-panel.day .card-glow--signature .image-request-btn{color:#d39510;background:rgba(212,175,55,0.1);box-shadow:inset 0 0 0 1.5px rgba(212,175,55,0.3)}
.saved-panel.day .card-glow--signature .image-request-btn:hover{background:rgba(212,175,55,0.3)!important;box-shadow:inset 0 0 0 1.5px rgba(212,175,55,0.2)!important}
.saved-panel.day .card-glow--signature .text-action-btn.info-btn{background:rgba(212,175,55,0.3);color:white;box-shadow:inset 0 0 0 0.7px rgba(212,175,55,0.3)}
.saved-panel.day .card-glow--signature .text-action-btn.info-btn:hover{background:rgba(212,175,55,0.45);box-shadow:inset 0 0 0 0.8px rgba(212,175,55,0.6)}
.saved-panel.day .rec-image.loading-skeleton{background:linear-gradient(90deg,rgba(160,82,45,0.1) 0%,rgba(160,82,45,0.2) 50%,rgba(160,82,45,0.1) 100%)}
.saved-panel.day .large-card{background:rgba(255,255,255,0.5);box-shadow:0 2px 10px rgba(139,69,19,0.10),inset 0 0 0 1px rgba(255,255,255,0.6)}
.saved-panel.day .large-card .rec-description{color:#5a4a42}
.saved-panel.day .image-request-btn{background:rgba(255,255,255,0.5);color:#A0522D;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.saved-panel.day .image-request-btn:hover:not(:disabled){background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.9)}
.saved-panel.day .image-request-btn.loading{background:rgba(255,255,255,0.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}

/* ── Rec card footer (like / dislike / share) ────────────────────────── */
.rec-card-bottom{display:flex;align-items:center;min-height:15px;position:relative}
.rec-card-bottom .partner-label{position:absolute;left:0;right:0;justify-content:center;pointer-events:none}
.rec-card-footer{display:flex;align-items:center;background:transparent;flex-shrink:0;margin-left:auto;position:relative;z-index:1}
.rec-footer-actions{display:flex;align-items:center;gap:2px}
.feedback-btn{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border:none;background:transparent;cursor:pointer;border-radius:50%;color:var(--text-muted,#999);padding:0;flex-shrink:0}
.day-mode .feedback-btn:hover{color:#A0522D}
.day-mode .feedback-btn.active{color:#A0522D}
.day-mode .feedback-btn.active svg{fill:#A0522D;stroke:#A0522D}
.night-mode .feedback-btn:hover{color:#c084fc}
.night-mode .feedback-btn.active{color:#c084fc}
.night-mode .feedback-btn.active svg{fill:#c084fc;stroke:#c084fc}
.feedback-btn:active{transform:scale(0.85)}
.rec-footer-btn{width:28px;height:28px}
/* ── Like / Dislike below AI message bubble ──────────────────────────── */
.message-feedback{display:flex;align-items:center;gap:2px;opacity:0; margin-top: 10px}
.message-bubble.ai:hover .message-feedback,.message-feedback:has(.feedback-btn.active){opacity:1}
.user-message-feedback{justify-content:flex-end;margin-top:4px}
.message-bubble.user:hover .user-message-feedback,.user-message-feedback:has(.feedback-btn.active),.message-bubble.user.touched .user-message-feedback{opacity:1}
.msg-feedback-btn{width:28px;height:28px}
.message-feedback-divider{width:1px;height:16px;background:rgba(212,175,55,0.2);margin:0 4px;flex-shrink:0}
.share-progress-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.share-progress-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 36px;border-radius:20px;min-width:280px;max-width:340px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
.night-mode.share-progress-card{background:#1e1438;border:1px solid rgba(139,92,246,0.25);color:#e2e8f0}
.day-mode.share-progress-card{background:#fffaf2;border:1px solid rgba(212,175,55,0.3);color:#3c2a1e}
.share-progress-genie{font-size:2rem;animation:share-bounce 1s ease-in-out infinite}
.share-progress-title{font-size:1rem;font-weight:600;letter-spacing:0.01em}
.night-mode .share-progress-title{color:#c084fc}
.day-mode .share-progress-title{color:#b87333}
.share-progress-bar-wrap{width:100%;height:6px;border-radius:99px;overflow:hidden}
.night-mode .share-progress-bar-wrap{background:rgba(139,92,246,0.15)}
.day-mode .share-progress-bar-wrap{background:rgba(212,175,55,0.15)}
.share-progress-bar{height:100%;border-radius:99px;transition:width 0.35s ease}
.night-mode .share-progress-bar{background:linear-gradient(90deg,#7c3aed,#c084fc);box-shadow:0 0 8px rgba(192,132,252,0.5)}
.day-mode .share-progress-bar{background:linear-gradient(90deg,#b87333,#D4AF37);box-shadow:0 0 8px rgba(212,175,55,0.45)}
.share-progress-label{font-size:0.82rem;opacity:0.75}
.share-fade-enter-active,.share-fade-leave-active{transition:opacity 0.25s ease}
.share-fade-enter-from,.share-fade-leave-to{opacity:0}
@keyframes share-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

/* ═══════════════════════════════════════════════════════════════════════
   RTL (Arabic) overrides
   `dir="rtl"` is set on <html> for Arabic, which already mirrors flow- and
   flex-based layout (the desktop sidebar moves to the right, text aligns to
   the right, etc.). These rules fix the remaining pieces that use *physical*
   CSS properties (left/right, translateX, box-shadow, padding) which the
   browser does NOT mirror automatically.
   ═══════════════════════════════════════════════════════════════════════ */
/* Sidebar — chat-history timestamp sits on the start (right) edge */
[dir="rtl"] .session-date{left:auto;right:15px}
/* Directional collapse / expand chevrons point the other way */
[dir="rtl"] .collapse-btn svg{transform:scaleX(-1)}
/* Composer — send + “＋” buttons live on the start (left) edge in RTL, and the textarea reserves its inner padding on that same side */
[dir="rtl"] .send-button{right:auto;left:6px}
[dir="rtl"] .mobile-toggle-inline{right:auto;left:46px;margin-right:0;margin-left:4px}
[dir="rtl"] .input-wrapper textarea{padding:15px 15px 15px 52px}
/* Settings toggle knob */
[dir="rtl"] .toggle-slider:before{left:auto;right:3px}
[dir="rtl"] .toggle-switch input:checked + .toggle-slider:before{transform:translateX(-24px)}
/* Saved-places slide-over — rests against the start (left) edge, so it animates in from the left and casts its shadow toward the right */
[dir="rtl"] .slide-panel-enter-from .saved-panel,
[dir="rtl"] .slide-panel-leave-to .saved-panel{transform:translateX(-100%)}
/* Fullscreen image controls + mobile action popover */
[dir="rtl"] .fullscreen-close-btn{right:auto;left:30px}
[dir="rtl"] .mobile-actions-popover{right:auto;left:24px}
/* Session-limit modal reason list — accent bar, marker and text indent move to the start (right) side */
[dir="rtl"] .limit-reasons li{padding:10px 36px 10px 12px;border-left:none;border-right:3px solid #D4AF37}
[dir="rtl"] .genie-chat-container.night-mode .limit-reasons li{border-right-color:#c084fc}
[dir="rtl"] .limit-reasons li::before{left:auto;right:16px}
@media (max-width:768px){
  /* Mobile drawer enters from the right (start edge) in RTL */
  [dir="rtl"] .sidebar{left:auto;right:0;transform:translateX(100%)}
  [dir="rtl"] .sidebar.sidebar-open{transform:translateX(0)}
  [dir="rtl"] .sidebar.sidebar-open~.scroll-container{transform:translateX(-98vw)}
  /* Header hamburger / new-chat buttons swap sides */
  [dir="rtl"] .mobile-nav{left:auto;right:15px}
  [dir="rtl"] .mobile-new-chat{right:auto;left:15px}
  /* Composer padding (mobile rule) + controls */
  [dir="rtl"] .input-wrapper textarea{padding:15px 15px 15px 50px}
  [dir="rtl"] .mobile-actions-popover{right:auto;left:35px}
  [dir="rtl"] .fullscreen-close-btn{right:auto;left:15px}
}

/* ── Profile modal, phones ──
   Scoped to `.profile-modal` and placed last on purpose: an @media block has
   no specificity bonus, so the earlier unscoped `.avatar-container{60px}`,
   `.plan-card` and `.profile-preferences` rules further down the file were
   silently winning and none of this applied. */
@media (max-width:480px){
  .profile-modal .modal-content{width:94%;max-height:92dvh}
  .profile-modal .profile-body{padding-top:50px}
  .profile-modal .profile-info{gap:11px;padding:0 14px;margin-top:4px;margin-bottom:12px}
  .profile-modal .avatar-container{width:50px;height:50px;padding:2px}
  .profile-modal .profile-avatar.default-avatar svg{width:29px;height:29px}
  .profile-modal .profile-details h4{font-size:1.05rem}
  .profile-modal .profile-details p{font-size:0.78rem}
  .profile-modal .plan-card{margin:0 14px 16px;padding:13px 14px}
  .profile-modal .profile-preferences{padding:0 14px 16px}
  .profile-modal .prefs-grid{grid-template-columns:1fr}
}

/* ── Quota notice above the composer ── */
.chat-input-container{position:relative}
.usage-notice{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:7px;max-width:95%;padding:8px 13px;border-radius:999px;font-size: 0.78125rem;font-weight:500;line-height:1.3;text-align:left;backdrop-filter:blur(14px) saturate(170%);-webkit-backdrop-filter:blur(14px) saturate(170%)}
.usage-notice svg{flex:0 0 auto}
/* Width tracks the composer at every breakpoint (Arsen 2026-09-01: "as much
   long as the chat-input-container ... or just 5% little"). 95%, not 100%: the
   small inset keeps it reading as a notice floating above the 32px-radius
   composer instead of a second bar stacked on it. The old 460px/760px caps
   were fixed phone/desktop measurements that stopped matching the composer
   whenever its width changed. */
.genie-chat-container.day-mode .usage-notice{color:#8a5a12;background:rgba(255,251,245,0.9);box-shadow:0 6px 20px rgba(120,80,30,0.16)}
.genie-chat-container.night-mode .usage-notice{color:#f0d79a;background:rgba(44,30,80,0.86);box-shadow:0 6px 22px rgba(0,0,0,0.42)}
.usage-notice-enter-active,.usage-notice-leave-active{transition:opacity 0.28s ease,transform 0.28s ease}
.usage-notice-enter-from,.usage-notice-leave-to{opacity:0;transform:translateX(-50%) translateY(6px)}
@media (prefers-reduced-motion:reduce){.usage-notice-enter-active,.usage-notice-leave-active{transition:none}}

/* ── Click-to-search place names in AI prose ── */
/* :deep — the place-search spans are injected via v-html, so scoped selectors
   without :deep never reach them (no data-v attribute). Mirrors the .text
   :deep(strong) pattern above. This is what renders the dotted underline AND
   the pointer cursor. */
.text :deep(.place-search) { border-bottom: 1px dotted currentColor; cursor: pointer; text-underline-offset: 3px; transition: opacity 0.15s ease; }
.text :deep(.place-search:hover) { opacity: 0.65; }

/* Chat→map "See route" CTA (transport answers with a routable card) —
   light/color feedback only on hover, never movement (founder rule). */
/* See-route CTA — the rec-map bar's visual twin (founder 2026-09-01:
   "make the rec-cta-btn look very same way the rec-map looks"). Same
   surface, radius, rim, type scale and hover recipe as .rec-map/.rec-map-bar. */
.route-cta-btn{display:flex;width:100%;align-items:center;gap:9px;margin:12px 0 4px;padding:11px 14px;border:none;border-radius:14px;background:rgba(255,255,255,0.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);color:#A0522D;font-weight:600;font-size:0.875rem;cursor:pointer;backdrop-filter:blur(2px) saturate(180%);-webkit-backdrop-filter:blur(2px) saturate(180%);transition:background 0.18s ease}
.route-cta-btn:hover{background:rgba(255,255,255,0.75)}
.genie-chat-container.night-mode .route-cta-btn{background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.1);color:#c084fc}
.genie-chat-container.night-mode .route-cta-btn:hover{background:rgba(255,255,255,0.14)}

/* Greeting: balanced wrapping so no single word sits alone on a line. */
.greeting{text-wrap:balance}

/* Mobile: a wrapped greeting's text box expands to full remaining width and
   centered lines float mid-box — reading as a big gap beside the lamp
   (founder 2026-08-31). Left-anchor the text against the lamp; the slack
   moves to the right edge where it is invisible. Desktop keeps center. */
@media (max-width:768px){.greeting{justify-content:center;text-align:center;white-space:pre-line;width:max-content;max-width:72%}.greeting-icon{height:38px;width:auto;align-self:auto}}

/* Route answers ("how to reach X"): the map exists only for the See-route
   button's fullscreen trip — its inline "Show on map" bar is noise next to
   the CTA (founder 2026-08-31). Keep it mounted, hide its chrome. */
:deep(.rec-map.route-only-map .rec-map-bar){display:none}
:deep(.rec-map.route-only-map){margin:0}

/* Greeting ink (founder 2026-09-01: "magical"): gradient text — works in
   every script the greeting speaks, unlike a Latin display font.

   Day stops are amber-800 -> purple-800, not amber-700 -> violet-600. Two
   reasons, both about the cream ground (#f5edda behind a centred empty-chat
   greeting):

   - Contrast. The greeting is 1.3rem/1.05rem at weight 150 — nowhere near
     WCAG large text, so it needs 4.5:1. The old #b45309 gave 4.31:1 at the
     end nearest the lamp, the thinnest, least legible part. #92400e is
     6.08:1; #6b21a8 is 7.48:1.
   - Tone. Day mode is one warm family — sienna #A0522D, tan #8b6b3d, gold
     #B7791F, copper #b87333 — with no purple anywhere; every other violet in
     this file is .night-mode scoped. Electric #7c3aed was the one cool note
     in the palette. Purple-800 has red in it, so it keeps the amber->purple
     travel (the genie signature both modes share) while sitting with the
     parchment instead of against it.

   Night keeps #c084fc -> #60a5fa: those stops are on #16213e, not cream. */
.greeting{background:linear-gradient(105deg,#92400e 10%,#6b21a8 90%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:0.01em}
.genie-chat-container.night-mode .greeting{background:linear-gradient(105deg,#c084fc 10%,#60a5fa 90%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}

/* Display prefs pills (font style / text size). */
.pill-row{display:flex;gap:8px;flex-wrap:wrap}
.pill-opt{padding:7px 14px;border-radius:14px;border:1px solid rgba(0,0,0,0.15);background:transparent;cursor:pointer;font:inherit;font-size:0.85rem;color:inherit}
.pill-opt--on{border-color:#7c3aed;color:#7c3aed;font-weight:600}
.genie-chat-container.night-mode .pill-opt{border-color:rgba(255,255,255,0.2);color:#aeb8c7}
.genie-chat-container.night-mode .pill-opt--on{border-color:#c084fc;color:#c084fc}

/* Mode toggle (Discovery/Nearby): svg was inline-baseline while the label
   carried the body line-height — text and icon sat at different optical
   heights (founder 2026-09-01). */
.mode-toggle-inline, .mode-toggle{line-height:1}
.mode-toggle-inline svg, .mode-toggle svg{display:block;flex-shrink:0}

.new-chat-btn svg, .new-chat-btn-collapsed svg{display:block;flex-shrink:0}
.new-chat-btn-collapsed{line-height:1}

/* Input row at Large: 18px x 1.4 + 30px padding outgrew the 50px round
   buttons beside it — trim vertical padding so the row stays ~50px
   (founder 2026-09-01). Normal/Small already land right at 15px. */
/* Composer rows, per ROOT SIZE. Every size keeps a one-line composer at
   exactly 50px (min-height): padding-top + padding-bottom + line-height = 50.
   The scale shifted up a notch 2026-09-03, so each tuned pair moved to the key
   now carrying its percentage — Small is 100% and uses the 14px/22px base rule
   above, Normal is 112.5% and takes the old 12px/26px. Large is the new 125%
   row: 1rem = 20px there, so line-height 30 keeps the ratio climbing as the
   founder tuned it, and 10px padding holds the 50px total. */
html[data-text-size="normal"] .input-wrapper textarea{padding-top:12px;padding-bottom:12px;line-height:26px}
html[data-text-size="big"] .input-wrapper textarea{padding-top:10px;padding-bottom:10px;line-height:30px}

/* Optical correction (founder 2026-09-01): serif faces (Palatino/Georgia)
   sit their word-mass lower than the sans, so the geometric icon reads
   high beside the label. Nudge the icon down to the serif's optical line.
   SVGs cannot inherit a font — the correction is positional by design. */
html[data-font-style="elegant"] .mode-toggle-inline svg,
html[data-font-style="elegant"] .mode-toggle svg,
html[data-font-style="classic"] .mode-toggle-inline svg,
html[data-font-style="classic"] .mode-toggle svg,
html[data-font-style="elegant"] .new-chat-btn svg,
html[data-font-style="classic"] .new-chat-btn svg{transform:translateY(1px)}
</style>