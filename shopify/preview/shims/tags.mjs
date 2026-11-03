/**
 * Shopify-specific Liquid tags that liquidjs does not know about.
 *
 * `renderSection` is injected rather than imported to avoid a cycle: the
 * section renderer needs the engine, and the engine needs these tags.
 */
export function registerTags(engine, { renderSection }) {
  registerRawBlock(engine, 'schema', () => '');
  registerRawBlock(engine, 'stylesheet', (css) => `<style>${css}</style>`);
  registerRawBlock(engine, 'javascript', (js) => `<script>${js}</script>`);

  // {% section 'header' %}
  engine.registerTag('section', {
    parse(tagToken) {
      this.sectionType = unquote(tagToken.args.trim());
    },
    *render(ctx, emitter) {
      emitter.write(yield renderSection(this.sectionType, ctx.environments));
    }
  });

  // Section groups are not used by this theme; render nothing rather than fail.
  engine.registerTag('sections', {
    parse() {},
    render() {
      return '';
    }
  });

  // {% style %} ... {% endstyle %} — contents are Liquid-rendered.
  registerRenderedBlock(engine, 'style', (html) => `<style>${html}</style>`);

  // {% form 'product', product, class: 'x' %} ... {% endform %}
  registerRenderedBlock(
    engine,
    'form',
    (html, args) => {
      const type = unquote((args.split(',')[0] || '').trim());
      const className = matchArg(args, 'class');
      const id = matchArg(args, 'id');
      const openTag = `<form ${attr('action', formAction(type))} ${attr('method', 'post')} ${attr(
        'class',
        className
      )} ${attr('id', id)} ${attr('data-form-type', type)}>`;
      return `${openTag}${html}</form>`;
    },
    { captureArgs: true }
  );

  // {% paginate collection.products by 12 %} — preview renders every item.
  registerRenderedBlock(engine, 'paginate', (html) => html);
}

const FORM_ACTIONS = {
  product: '/cart/add',
  cart: '/cart',
  contact: '/contact#contact_form',
  customer: '/contact#contact_form',
  new_comment: '#',
  localization: '/localization',
  activate_customer_password: '#',
  create_customer: '#',
  customer_login: '#',
  recover_customer_password: '#',
  reset_customer_password: '#',
  guest_login: '#',
  storefront_password: '/password'
};

function formAction(type) {
  return FORM_ACTIONS[type] ?? '#';
}

function unquote(value) {
  return String(value ?? '').replace(/^['"]|['"]$/g, '');
}

function attr(name, value) {
  return value ? `${name}="${String(value).replace(/"/g, '&quot;')}"` : '';
}

function matchArg(args, name) {
  const match = args.match(new RegExp(`${name}\\s*:\\s*(['"])(.*?)\\1`));
  return match ? match[2] : '';
}

/**
 * A block whose body is never parsed as Liquid — the raw text is handed to
 * `wrap`. Used for {% schema %}, {% stylesheet %} and {% javascript %}.
 */
function registerRawBlock(engine, name, wrap) {
  engine.registerTag(name, {
    parse(tagToken, remainTokens) {
      this.body = '';
      while (remainTokens.length) {
        const token = remainTokens.shift();
        if (token.name === `end${name}`) return;
        this.body += token.getText();
      }
      throw new Error(`{% ${name} %} is missing {% end${name} %}`);
    },
    render() {
      return wrap(this.body);
    }
  });
}

/** A block whose body is parsed and rendered as Liquid before `wrap` runs. */
function registerRenderedBlock(engine, name, wrap, { captureArgs = false } = {}) {
  engine.registerTag(name, {
    parse(tagToken, remainTokens) {
      this.args = captureArgs ? tagToken.args : '';
      this.templates = [];

      const stream = this.liquid.parser.parseStream(remainTokens);
      stream
        .on(`tag:end${name}`, () => stream.stop())
        .on('template', (template) => this.templates.push(template))
        .on('end', () => {
          throw new Error(`{% ${name} %} is missing {% end${name} %}`);
        });
      stream.start();
    },
    *render(ctx, emitter) {
      const html = yield this.liquid.renderer.renderTemplates(this.templates, ctx);
      emitter.write(wrap(html, this.args));
    }
  });
}
