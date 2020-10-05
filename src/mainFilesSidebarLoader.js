/**
 * @copyright Copyright (c) 2019 Marco Ambrosini <marcoambrosini@pm.me>
 *
 * @author Marco Ambrosini <marcoambrosini@pm.me>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Vue from 'vue'
import FilesSidebarCallView from './views/FilesSidebarCallView'
import FilesSidebarTab from './views/FilesSidebarTab'
import { leaveConversation } from './services/participantsService'

const isEnabled = function(fileInfo) {
	if (fileInfo && !fileInfo.isDirectory()) {
		return true
	}

	const token = OCA.Talk.store.getters.getToken()

	// If the Talk tab can not be displayed then the current conversation is
	// left; this must be done here because "setFileInfo" will not get
	// called with the new file if the tab can not be displayed.
	if (token) {
		leaveConversation(token)
	}

	OCA.Talk.store.dispatch('updateTokenAndFileIdForToken', {
		newToken: null,
		newFileId: null,
	})

	return false
}

const View = Vue.extend(FilesSidebarTab)
let TabInstance = null

window.addEventListener('DOMContentLoaded', () => {
	if (OCA.Files && OCA.Files.Sidebar) {
		OCA.Files.Sidebar.registerSecondaryView(new FilesSidebarCallView())
		OCA.Files.Sidebar.registerTab(new OCA.Files.Sidebar.Tab({
			id: 'chat',
			name: t('spreed', 'Chat'),
			icon: 'icon-talk',
			enabled: isEnabled,

			async mount(el, fileInfo, context) {
				if (TabInstance) {
					TabInstance.$destroy()
				}
				TabInstance = new View({
					// Better integration with vue parent component
					parent: context,
				})
				// Only mount after we have all the info we need
				await TabInstance.update(fileInfo)
				TabInstance.$mount(el)
			},
			update(fileInfo) {
				TabInstance.update(fileInfo)
			},
			destroy() {
				TabInstance.$destroy()
				TabInstance = null
			},
		}))
	}
})
