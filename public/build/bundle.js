
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    const seen_callbacks = new Set();
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const time = readable(new Date(), function start(set) {
    	const interval = setInterval(() => {
    		set(new Date());
    	}, 1000);

    	return function stop() {
    		clearInterval(interval);
    	};
    });

    /* src/Box.svelte generated by Svelte v3.18.1 */

    const file = "src/Box.svelte";

    function create_fragment(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "box svelte-1ife9af");
    			add_location(div, file, 11, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$scope, $$slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.1 */
    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (77:1) {#each raceOptions as raceOption}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*raceOption*/ ctx[22] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*raceOption*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file$1, 77, 2, 1461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(77:1) {#each raceOptions as raceOption}",
    		ctx
    	});

    	return block;
    }

    // (83:1) {#each sexOptions as sexOption}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*sexOption*/ ctx[19] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*sexOption*/ ctx[19];
    			option.value = option.__value;
    			add_location(option, file$1, 83, 2, 1592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(83:1) {#each sexOptions as sexOption}",
    		ctx
    	});

    	return block;
    }

    // (98:0) {#if visible}
    function create_if_block(ctx) {
    	let current;

    	const box = new Box({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};

    			if (dirty & /*$$scope, status, $time, age, sex, race, name*/ 33554527) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(98:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (99:0) <Box>
    function create_default_slot(ctx) {
    	let h2;

    	let t0_value = (/*name*/ ctx[0] !== ""
    	? "Hello " + toTitleCase(/*name*/ ctx[0]) + "!"
    	: "Hello!") + "";

    	let t0;
    	let t1;
    	let t2_value = (/*race*/ ctx[1] == "Asian" ? "an" : "a") + "";
    	let t2;
    	let t3;

    	let t4_value = (/*race*/ ctx[1] == "White"
    	? /*race*/ ctx[1].toLowerCase()
    	: /*race*/ ctx[1]) + "";

    	let t4;
    	let t5;
    	let t6_value = /*sex*/ ctx[2].toLowerCase() + "";
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let p0;
    	let t10;
    	let strong0;
    	let t11_value = /*formatter*/ ctx[7].format(/*$time*/ ctx[6]) + "";
    	let t11;
    	let t12;
    	let t13;
    	let p1;
    	let t14;
    	let strong1;
    	let t16;
    	let t17;
    	let p2;
    	let t19;
    	let button0;
    	let t21;
    	let button1;
    	let t23;
    	let br0;
    	let br1;
    	let t24;
    	let t25_value = /*tryAgain*/ ctx[11](/*status*/ ctx[4]) + "";
    	let t25;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = text("\n\tYou are ");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = text(", and you are currently ");
    			t8 = text(/*age*/ ctx[3]);
    			t9 = text(" years old.\n\t");
    			p0 = element("p");
    			t10 = text("The time is currently ");
    			strong0 = element("strong");
    			t11 = text(t11_value);
    			t12 = text(" (I hope).");
    			t13 = space();
    			p1 = element("p");
    			t14 = text("Given those parameters, my prediction is that you are \n\t\t");
    			strong1 = element("strong");
    			strong1.textContent = `${/*activities*/ ctx[10][1]}`;
    			t16 = text(" right now.");
    			t17 = space();
    			p2 = element("p");
    			p2.textContent = "Did I get it right?";
    			t19 = space();
    			button0 = element("button");
    			button0.textContent = "Yes >";
    			t21 = space();
    			button1 = element("button");
    			button1.textContent = "No =";
    			t23 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t24 = space();
    			t25 = text(t25_value);
    			add_location(h2, file$1, 99, 1, 1897);
    			add_location(strong0, file$1, 104, 24, 2153);
    			add_location(p0, file$1, 103, 1, 2125);
    			add_location(strong1, file$1, 108, 2, 2276);
    			add_location(p1, file$1, 106, 1, 2213);
    			add_location(p2, file$1, 112, 1, 2334);
    			attr_dev(button0, "class", "svelte-6xtft0");
    			toggle_class(button0, "active", /*status*/ ctx[4] === "Yes 🤠");
    			add_location(button0, file$1, 115, 1, 2367);
    			attr_dev(button1, "class", "svelte-6xtft0");
    			toggle_class(button1, "active", /*status*/ ctx[4] === "No 😔");
    			add_location(button1, file$1, 119, 1, 2471);
    			add_location(br0, file$1, 123, 1, 2572);
    			add_location(br1, file$1, 123, 5, 2576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t10);
    			append_dev(p0, strong0);
    			append_dev(strong0, t11);
    			append_dev(p0, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t14);
    			append_dev(p1, strong1);
    			append_dev(p1, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, t25, anchor);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[17], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[18], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1 && t0_value !== (t0_value = (/*name*/ ctx[0] !== ""
    			? "Hello " + toTitleCase(/*name*/ ctx[0]) + "!"
    			: "Hello!") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*race*/ 2 && t2_value !== (t2_value = (/*race*/ ctx[1] == "Asian" ? "an" : "a") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*race*/ 2 && t4_value !== (t4_value = (/*race*/ ctx[1] == "White"
    			? /*race*/ ctx[1].toLowerCase()
    			: /*race*/ ctx[1]) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*sex*/ 4 && t6_value !== (t6_value = /*sex*/ ctx[2].toLowerCase() + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*age*/ 8) set_data_dev(t8, /*age*/ ctx[3]);
    			if (dirty & /*$time*/ 64 && t11_value !== (t11_value = /*formatter*/ ctx[7].format(/*$time*/ ctx[6]) + "")) set_data_dev(t11, t11_value);

    			if (dirty & /*status*/ 16) {
    				toggle_class(button0, "active", /*status*/ ctx[4] === "Yes 🤠");
    			}

    			if (dirty & /*status*/ 16) {
    				toggle_class(button1, "active", /*status*/ ctx[4] === "No 😔");
    			}

    			if (dirty & /*status*/ 16 && t25_value !== (t25_value = /*tryAgain*/ ctx[11](/*status*/ ctx[4]) + "")) set_data_dev(t25, t25_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(t25);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(99:0) <Box>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let input0;
    	let t2;
    	let br2;
    	let t3;
    	let select0;
    	let t4;
    	let select1;
    	let t5;
    	let input1;
    	let input1_updating = false;
    	let t6;
    	let br3;
    	let br4;
    	let t7;
    	let div;
    	let button;
    	let strong;
    	let t9;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	let each_value_1 = /*raceOptions*/ ctx[8];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*sexOptions*/ ctx[9];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[16].call(input1);
    	}

    	let if_block = /*visible*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			t0 = text("Could you tell me a little more information about yourself?\t\n\n");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = text("\n\nMy name is\n");
    			input0 = element("input");
    			t2 = text("\nand I am a...\n\n");
    			br2 = element("br");
    			t3 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = text("\n. I'm\n");
    			input1 = element("input");
    			t6 = text("\nyears old.\n");
    			br3 = element("br");
    			br4 = element("br");
    			t7 = space();
    			div = element("div");
    			button = element("button");
    			strong = element("strong");
    			strong.textContent = "Do your magical calculations!";
    			t9 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(br0, file$1, 68, 0, 1320);
    			add_location(br1, file$1, 68, 4, 1324);
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 71, 0, 1341);
    			add_location(br2, file$1, 74, 0, 1392);
    			if (/*race*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[14].call(select0));
    			add_location(select0, file$1, 75, 0, 1397);
    			if (/*sex*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[15].call(select1));
    			add_location(select1, file$1, 81, 0, 1531);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			add_location(input1, file$1, 87, 0, 1665);
    			add_location(br3, file$1, 89, 0, 1727);
    			add_location(br4, file$1, 89, 4, 1731);
    			add_location(strong, file$1, 93, 1, 1811);
    			add_location(button, file$1, 92, 0, 1772);
    			set_style(div, "text-align", "center");
    			add_location(div, file$1, 91, 0, 1737);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*name*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, select0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*race*/ ctx[1]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, select1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*sex*/ ctx[2]);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*age*/ ctx[3]);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, strong);
    			insert_dev(target, t9, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[14]),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[15]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(button, "click", /*handleClick*/ ctx[12], { once: true }, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*raceOptions*/ 256) {
    				each_value_1 = /*raceOptions*/ ctx[8];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*race*/ 2) {
    				select_option(select0, /*race*/ ctx[1]);
    			}

    			if (dirty & /*sexOptions*/ 512) {
    				each_value = /*sexOptions*/ ctx[9];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*sex*/ 4) {
    				select_option(select1, /*sex*/ ctx[2]);
    			}

    			if (!input1_updating && dirty & /*age*/ 8) {
    				set_input_value(input1, /*age*/ ctx[3]);
    			}

    			input1_updating = false;

    			if (/*visible*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(select0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(select1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t9);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toTitleCase(str) {
    	return str.replace(/\w\S*/g, function (txt) {
    		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    	});
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $time;
    	validate_store(time, "time");
    	component_subscribe($$self, time, $$value => $$invalidate(6, $time = $$value));

    	const formatter = new Intl.DateTimeFormat("en",
    	{
    			hour12: true,
    			hour: "numeric",
    			minute: "2-digit",
    			second: "2-digit"
    		});

    	let name = "Timothy";

    	//race 
    	let raceOptions = ["Black", "White", "Asian", "Hispanic"];

    	let race = "Black";

    	// sex
    	let sexOptions = ["man", "woman"];

    	let sex = "man";

    	// age
    	let age = "21";

    	//activities
    	// let activities = "";
    	let activities = ["reading", "studying", "sleeping"];

    	let status = "";

    	function tryAgain(status) {
    		if (status == "Yes 🤠") {
    			return "Awesome! Keep it up! I think you're great at " + activities[0] + " :)";
    		} else if (status == "No 😔") {
    			return "Oh man, I'm not very good at this... My other guesses (in order of confidence) are that you are: " + activities;
    		} else if (status == "") {
    			return ""; //+ activities.forEach(element => log(element));
    		}
    	}

    	let visible = false;

    	function handleClick() {
    		$$invalidate(5, visible = true);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function select0_change_handler() {
    		race = select_value(this);
    		$$invalidate(1, race);
    		$$invalidate(8, raceOptions);
    	}

    	function select1_change_handler() {
    		sex = select_value(this);
    		$$invalidate(2, sex);
    		$$invalidate(9, sexOptions);
    	}

    	function input1_input_handler() {
    		age = to_number(this.value);
    		$$invalidate(3, age);
    	}

    	const click_handler = () => $$invalidate(4, status = "Yes 🤠");
    	const click_handler_1 = () => $$invalidate(4, status = "No 😔");

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("raceOptions" in $$props) $$invalidate(8, raceOptions = $$props.raceOptions);
    		if ("race" in $$props) $$invalidate(1, race = $$props.race);
    		if ("sexOptions" in $$props) $$invalidate(9, sexOptions = $$props.sexOptions);
    		if ("sex" in $$props) $$invalidate(2, sex = $$props.sex);
    		if ("age" in $$props) $$invalidate(3, age = $$props.age);
    		if ("activities" in $$props) $$invalidate(10, activities = $$props.activities);
    		if ("status" in $$props) $$invalidate(4, status = $$props.status);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("$time" in $$props) time.set($time = $$props.$time);
    	};

    	return [
    		name,
    		race,
    		sex,
    		age,
    		status,
    		visible,
    		$time,
    		formatter,
    		raceOptions,
    		sexOptions,
    		activities,
    		tryAgain,
    		handleClick,
    		input0_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
