//------------------------------------------------------------------------------
// Create the menu component to filter the list of passwords
//------------------------------------------------------------------------------

const createMenu = (views, id) => {
  const view = {
    component: null,
    active: 'all-pwd',
    id,
    views,

    //--------------------------------------------------------------------------
    // Set the active menu button

    setActive: function (cls) {
      // Clear current active button
      this.component.find(`.${this.active}`).removeClass('active');

      // Update active
      if (cls) this.active = cls;

      // Return if searching
      if (this.active === 'search') return;

      // Set to no filter if button gone (from delete password)
      let $new = this.component.find(`.${this.active}`);
      if ($new.length === 0) {
        this.active = 'all-pwd';
        this.views.browse.query = '';
        $new = this.component.find('.all-pwd');
      }

      // Set new active button
      this.component.find(`.${this.active}`).addClass('active');
    },

    //--------------------------------------------------------------------------
    // Set the filter

    setFilter: function (query) {
      this.views.setView('browse');
      this.views.browse.query = query;
      this.views.browse.update();
    },

    //--------------------------------------------------------------------------
    // Initialize

    init: function () {
      this.component = $(`<section>`).attr('id', id);
      this.views[this.id] = this;
      this.views.append(id);
      this.update();
    },

    //--------------------------------------------------------------------------
    // Update

    update: function () {
      // Ajax
      $.get('/api/users/myinfo').then(({ orgs, categories }) => {
        // Standard buttons
        const $add = $btnIconText('add-pwd', 'plus', 'Add password');
        $add.on('click', () => this.views.setView('add'));

        // All passwords
        const $all = $btnIconText('all-pwd', 'home', 'All passwords');
        $all.on('click', () => {
          this.setActive('all-pwd');
          this.setFilter('');
        });

        // Only passwords owned by user
        const $own = $btnIconText('own-pwd', 'user', 'Own passwords');
        $own.on('click', () => {
          this.setActive('own-pwd');
          this.setFilter('?type=own');
        });

        // Assemble static part of component
        this.component
          .empty()
          .append(
            $add,
            $('<div class="hr">'),
            $all,
            $own,
            $('<div class="hr">')
          );

        // Append buttons to filter by organization
        orgs.forEach(({ org_id, org_name, org_icon }) => {
          const cls = `org-${org_id}`;
          const $button = $btnIconText(cls, org_icon, org_name);
          $button.appendTo(this.component).on('click', () => {
            this.setActive(cls);
            this.setFilter(`?type=org&val=${org_id}`);
          });
        });

        this.component.append($($('<div class="hr">')));

        // Append buttons to filter by category
        categories.forEach(({ cat_id, cat_name, cat_icon }) => {
          const cls = `cat-${cat_id}`;
          const $button = $btnIconText(cls, cat_icon, cat_name);
          $button.appendTo(this.component).on('click', () => {
            this.setActive(cls);
            this.setFilter(`?type=cat&val=${cat_id}`);
          });
        });

        // Set active button and update browse
        this.setActive();
        this.views.browse.update();
      });
    },
  };

  view.init();
};
