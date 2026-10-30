# Registry

Resources a project adds with `npx allyhub add <type>/<name>` (`3d-model/monitor`, `scenery/home-desk-day`, `skill/product-demos`): models, 3D sceneries, components and templates. This folder is itself an AllyHub project, laid out as a project that added them is: what `allyhub add` copies lands at the same path in yours.

- `models/<name>/model.ts`: the products as 3D model pieces (a monitor, a laptop, a keyboard, a tablet, a desk, a chair, a mouse, a trackpad, a phone, a microphone, a speaker), each opened alone and put in any scenery that imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any size or finish.
- `components/kit/`: the modelling library the pieces and the settings are built with, written in TypeScript with AllyHub's model API at a real product's published size. Every size and finish is an option with a default.
- `components/room/`: a room's shell (walls, window, floor, ceiling), its surfaces and its screens.
- `components/settings/<setting>/`: a setting, the kit laid out in its room (`props.ts`) and lit and filmed (`scenery.ts`).
- `sceneries/<setting>-[demo-]<look>/scenery.ts`: the sceneries, one per version and look, each baked on its own. A type of item has a folder of its own, as shadcn gives one to each: `allyhub add` puts a scenery in `sceneries/`, the code it shares in `components/`, what it fetches in `assets/media/` and its bake in `.allyhub/cache/bake/`.
- `assets/media/`: files made for the kit. Textures, HDRIs and models from Poly Haven (CC0) are fetched by `allyhub add`, not kept here.

Every scenery names its screens (`monitor-screen`, `laptop-screen`, `phone-screen`) so a video puts its own interface on them with `screen()`, and its cameras by what they film.

Code is MIT. An asset carries its own licence (CC0 preferred, CC-BY with its author and source).

Product names in a model's description say which product's published size and shape it follows, so it can be found by them. AllyHub is not affiliated with their makers, and the models carry no logos or brand names.
