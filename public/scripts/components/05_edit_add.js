//------------------------------------------------------------------------------
// Create a form to add or edit a password
//------------------------------------------------------------------------------

const createForm = (views, id, title) => {
  const view = {
    component: null,
    genOptions: new Set(['lower', 'upper', 'digits']),
    genLength: 10,
    genLengthMin: 10,
    pwd_id: -1,
    id,
    views,

    //--------------------------------------------------------------------------
    // Choose AJAX method and url depending on the form type: edit or add

    submitMethod: function () {
      return this.id === 'edit' ? 'PUT' : 'POST';
    },

    submitUrl: function () {
      return this.id === 'edit'
        ? `/api/passwords/${this.pwd_id}`
        : '/api/passwords';
    },

    updateUrl: function () {
      return this.id === 'edit'
        ? `/api/users/myinfo?id=${this.pwd_id}`
        : '/api/users/myinfo';
    },

    //--------------------------------------------------------------------------
    // Clear input fields

    clear: function () {
      this.component.find('input').val('');
      return this;
    },

    //--------------------------------------------------------------------------
    // Activate or deactivate the decrease button

    setDecreaseState: function () {
      const $decrease = this.component.find('.decrease');
      if (this.genLength === this.genLengthMin) {
        $decrease.attr('disabled', 'disabled').addClass('inactive');
      } else {
        $decrease.removeAttr('disabled').removeClass('inactive');
      }
    },

    //--------------------------------------------------------------------------
    // Initialize

    init: function () {
      const $container = $('<section>').attr('id', this.id);
      this.component = $container;
      this.views[this.id] = this;

      const $form = $('<form>')
        .attr('id', `${this.id}-form`)
        .appendTo($container);

      // Set submit listener
      $form.on('submit', (event) => {
        event.preventDefault();

        // Send data to server
        $.ajax({
          method: this.submitMethod(),
          url: this.submitUrl(),
          data: $(`#${this.id}-form`).serialize(),
        }).then(() => {
          this.clear();
          this.views.menu.update();
          this.views.browse.update();
          this.views.setView('browse');
        });
      });
    },

    //--------------------------------------------------------------------------
    // Update

    update: function () {
      // Ajax
      $.get(this.updateUrl()).then(({ orgs, categories, passwords }) => {
        // Dynamic field: Categories
        const id = this.id;
        const $categories = $select(
          'Category',
          `${id}-category-id`,
          'category_id',
          categories,
          'cat_id',
          'cat_name'
        );

        // Dynamic field: Organizations
        const $orgs = $select(
          'Organization',
          `${id}-org-id`,
          'org_id',
          orgs,
          'org_id',
          'org_name'
        );

        // Toggle buttons to set options for generating password
        const $toggles = $('<div class="toggles">').append(
          $button('lower', 'a'),
          $button('upper', 'A'),
          $button('digits', '1'),
          $button('symbols', '#'),
          $button('punct', '?'),
          $button('brackets', '()')
        );

        // Password generation buttons
        const $genButtons = $('<div class="gen">').append(
          $btnIcon('gen-pwd', 'angle-double-right'),
          $('<div>'),
          $toggles,
          $('<div>'),
          $numberPicker('length', this.genLengthMin)
        );

        // Action buttons
        const $actionButtons = $('<div class="action">').append(
          $button('submit', 'Submit', 'submit'),
          $button('reset', 'Reset', 'reset'),
          $button('cancel', 'Cancel')
        );

        // Append all components
        const password = passwords ? passwords[0] : {}; // Edit vs add
        const $form = this.component.find('form');
        $form.empty();
        $form.append(
          $(`<div class="title">${title}</div>`),
          $input('Site name', `${id}-name`, 'site_name', 'text', password),
          $input('Site URL', `${id}-url`, 'site_url', 'url', password),
          $input('Login', `${id}-login`, 'site_login', 'text', password),
          $orgs,
          $categories,
          $input('Password', `${id}-pwd`, 'site_pwd', 'text', password),
          $('<div class="label">Generate</div>'),
          $genButtons,
          $actionButtons
        );

        // Set decrease button state
        this.setDecreaseState();

        // Set toggle buttons state
        [...this.genOptions].forEach((option) => {
          $form.find(`.${option}`).addClass('on');
        });

        // Set length listeners
        $form.find('.increase').on('click', () => this.changeGenLength(1));
        $form.find('.decrease').on('click', () => this.changeGenLength(-1));

        // Set toggle listeners
        ['lower', 'upper', 'digits', 'symbols', 'punct', 'brackets'].forEach(
          (option) => {
            const $button = $form.find(`.gen .${option}`);
            $button.on('click', () => this.setGenOption(option));
          }
        );

        // Set generate listener
        $form.find('.gen-pwd').on('click', () => {
          $form
            .find(`#${id}-pwd`)
            .val(genPassword(this.genLength, this.genOptions));
        });

        // Set cancel listener
        $form.find('.cancel').on('click', () => {
          this.clear();
          this.views.setView('browse');
        });
      });
    },

    //--------------------------------------------------------------------------
    // Change the generated password length

    changeGenLength: function (n) {
      this.genLength = Math.max(this.genLength + n, this.genLengthMin);
      this.component.find('.length .value').text(this.genLength);
      this.setDecreaseState();
    },

    //--------------------------------------------------------------------------
    // Set the generated password options

    setGenOption: function (option) {
      const $button = this.component.find(`.gen .${option}`);

      // Toggle off
      if ($button.hasClass('on')) {
        if (this.genOptions.size === 1) return;
        this.genOptions.delete(option);
        $button.removeClass('on');
        return;
      }

      // Toggle on
      this.genOptions.add(option);
      $button.addClass('on');
    },
  };

  view.init();
};
