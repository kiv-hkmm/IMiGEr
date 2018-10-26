import App from './app.js';

/**
 * Application running on the UploadFiles page.
 */
class UploadFilesApp extends App {
	/**
	 * Application startup method. It hooks event listeners to elements already present on the page and add listeners of auth events.
	 */
	run() {
		console.log('running...');

		// auth popup
		const header = document.getElementById('header');

		const loginPopup = new LoginPopup;
		header.appendChild(loginPopup.render());

		const registerPopup = new RegisterPopup;
		header.appendChild(registerPopup.render());

		document.getElementById('toggleLoginPopupButton').addEventListener('click', () => {
			registerPopup.close();
			loginPopup.toggle();
		});

		document.getElementById('toggleRegisterPopupButton').addEventListener('click', () => {
			loginPopup.close();
			registerPopup.toggle();
		});

		document.getElementById('logoutButton').addEventListener('click', e => {
			e.preventDefault();
			this._logOut();
		});

		// private diagrams list
		const privateDiagramList = document.getElementById('privateDiagramList');
		privateDiagramList.querySelectorAll('.remove-diagram-button').forEach(button => {
			button.addEventListener('click', this._removeDiagram);
		});

		// auth events
		const usernameLabel = document.getElementById('usernameLabel');

		document.addEventListener(LoggedInEvent.name, e => {
			this._loadPrivateDiagrams();
			usernameLabel.innerText = e.detail.username;
		});
		document.addEventListener(LoggedOutEvent.name, () => {
			privateDiagramList.innerHTML = '';
			usernameLabel.innerText = '';
		});
	}

	/**
	 * Logs user out.
	 */
	async _logOut() {
		try {
			await AJAX.get(Constants.API.logOut);

			document.dispatchEvent(new LoggedOutEvent);

			document.body.classList.remove('loggedIn');
			document.body.classList.add('loggedOut');

		} catch (error) {
			console.error(error);
			alert('Something went wrong. Check console for more details.');
		}
	}

	/**
	 * Loads private diagrams of the logged in user and adds them to a list.
	 */
	async _loadPrivateDiagrams() {
		try {
			const data = await AJAX.getJSON(Constants.API.getPrivateDiagrams);

			data.forEach(diagram => {
				privateDiagramList.appendChild(DOM.h('li', {}, [
					DOM.h('a', {
						href: app.homeUrl + 'graph?diagramId=' + diagram.id,
						innerText: diagram.name,
					}),
					DOM.h('button', {
						class: 'button remove-diagram-button',
						'data-id': diagram.id,
						'data-name': diagram.name,
						onClick: this._removeDiagram,
					}, [
						DOM.h('img', {
							src: 'images/button_cancel.png',
							alt: 'Odstranit',
						}),
					]),
				]));
			});

		} catch (error) {
			console.error(error);
			alert('Something went wrong. Check console for more details.');
		}
	}

	/**
	 * Removes diagram from DB and reloads the page.
	 */
	async _removeDiagram() {
		let diagramId = this.getAttribute('data-id');
		let diagramName = this.getAttribute('data-name');

		if (confirm('Do you really want to delete ' + diagramName + '?')) {
			try {
				await AJAX.delete(Constants.API.removeDiagram + '?diagramId=' + diagramId);

				location.reload(true);

			} catch (error) {
				if (error instanceof HttpError) {
					switch (error.response.status) {
						case 401:
							alert('You are either not logged in or not an owner of this diagram.');
							break;
						default:
							console.error(error);
							alert('Something went wrong. Check console for more details.');
					}
				} else {
					console.error(error);
					alert('Something went wrong. Check console for more details.');
				}
			}
		}
	}
}

export default UploadFilesApp;
