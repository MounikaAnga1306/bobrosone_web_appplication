import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  Snowflake,
  Star,
  BedDouble,
  Armchair,
} from "lucide-react";
import { Checkbox } from "../components/ui/Checkbox";

const popularOptions = [
  { label: "AC",        icon: <Snowflake className="h-4 w-4" /> },
  { label: "Primo",     icon: <Star      className="h-4 w-4" /> },
  { label: "6PM-12AM",  icon: <Sunset    className="h-4 w-4" /> },
  { label: "Sleeper",   icon: <BedDouble className="h-4 w-4" /> },
];

const busTypeOptions = [
  { label: "AC",      icon: <Snowflake className="h-4 w-4" /> },
  { label: "Non-AC",  icon: <Snowflake className="h-4 w-4 opacity-40" /> },
  { label: "Seater",  icon: <Armchair  className="h-4 w-4" /> },
  { label: "Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const singleOptions = [
  { label: "Single Seater",  icon: <Armchair  className="h-4 w-4" /> },
  { label: "Single Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

// ── Time slot labels — MUST match filterBuses.js exactly ─────────────────────
const timeSlots = [
  { label: "12 AM - 6 AM",  icon: <Moon     className="h-4 w-4" /> },
  { label: "6 AM - 12 PM",  icon: <Sun      className="h-4 w-4" /> },
  { label: "12 PM - 6 PM",  icon: <CloudSun className="h-4 w-4" /> },
  { label: "6 PM - 12 AM",  icon: <Sunset   className="h-4 w-4" /> },
];

const EVENING_DEP_SLOT = "6 PM - 12 AM";

// ─────────────────────────────────────────────────────────────────────────────
const CheckboxSection = ({
  title,
  items,
  searchPlaceholder,
  selected,
  onToggle,
  onClear,
  showSearch = true,
  initialShow = 4,
}) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );
  const visible = search.trim()
    ? filtered
    : showAll
    ? filtered
    : filtered.slice(0, initialShow);
  const hasMore = !search.trim() && filtered.length > initialShow;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={onClear}
          disabled={selected.size === 0}
          className={`text-xs font-bold ${
            selected.size === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>

      {showSearch && (
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground pr-9"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-2.5">
        {visible.length === 0 ? (
          <p className="text-xs text-gray-400">No results found.</p>
        ) : (
          visible.map((item) => (
            <label key={item} className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox checked={selected.has(item)} onChange={() => onToggle(item)} />
              <span className="text-sm text-foreground">{item}</span>
            </label>
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-xs font-medium text-[#FD561E] mt-2 hover:underline cursor-pointer"
        >
          {showAll ? "− Show less" : `+ Show all ${filtered.length} ${title.toLowerCase()}`}
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const FiltersSidebar = ({ onFilterChange, trips = [], externalFilters = null }) => {
  const [chipSelected, setChipSelected] = useState(new Set());
  const [depTime,   setDepTime]   = useState(new Set());
  const [arrTime,   setArrTime]   = useState(new Set());
  const [boarding,  setBoarding]  = useState(new Set());
  const [dropping,  setDropping]  = useState(new Set());
  const [ops,       setOps]       = useState(new Set());
  const [amens,     setAmens]     = useState(new Set());

  // ── Sync from external (mobile modal) ────────────────────────────────────
  useEffect(() => {
    if (!externalFilters) return;
    const next = new Set();
    if (externalFilters.ac)           { next.add("Popular__AC");      next.add("Bus Type__AC"); }
    if (externalFilters.nonAc)          next.add("Bus Type__Non-AC");
    if (externalFilters.seater)         next.add("Bus Type__Seater");
    if (externalFilters.sleeper)      { next.add("Popular__Sleeper"); next.add("Bus Type__Sleeper"); }
    if (externalFilters.primo)          next.add("Popular__Primo");
    if (externalFilters.evening)        next.add("Popular__6PM-12AM");
    if (externalFilters.singleSeater)   next.add("Single Seater / Sleeper__Single Seater");
    if (externalFilters.singleSleeper)  next.add("Single Seater / Sleeper__Single Sleeper");
    setChipSelected(next);
    setDepTime(new Set(externalFilters.depTime   || []));
    setArrTime(new Set(externalFilters.arrTime   || []));
    setBoarding(new Set(externalFilters.boarding || []));
    setDropping(new Set(externalFilters.dropping || []));
    setOps(new Set(externalFilters.ops           || []));
    setAmens(new Set(externalFilters.amens       || []));
  }, [externalFilters]);

  // ── Derived points / operators from trips ────────────────────────────────
  const boardingPoints = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      const raw = t.boardingTimes || [];
      (Array.isArray(raw) ? raw : [raw]).forEach((p) => {
        const name = p?.bpName || p?.name || p?.pointName || null;
        if (name?.trim()) set.add(name.trim());
      });
    });
    return [...set].sort();
  }, [trips]);

  const droppingPoints = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      const raw = t.droppingTimes || [];
      (Array.isArray(raw) ? raw : [raw]).forEach((p) => {
        const name = p?.bpName || p?.name || p?.pointName || null;
        if (name?.trim()) set.add(name.trim());
      });
    });
    return [...set].sort();
  }, [trips]);

  const operators = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      if (t.travels?.trim()) set.add(t.travels.trim());
    });
    return [...set].sort();
  }, [trips]);

  // ── Helper: build filter object ───────────────────────────────────────────
  const buildFilters = ({
    chips = chipSelected,
    dep   = depTime,
    arr   = arrTime,
    board = boarding,
    drop  = dropping,
    op    = ops,
    am    = amens,
  } = {}) => ({
    ac:            chips.has("Bus Type__AC")     || chips.has("Popular__AC"),
    nonAc:         chips.has("Bus Type__Non-AC"),
    seater:        chips.has("Bus Type__Seater"),
    sleeper:       chips.has("Bus Type__Sleeper")|| chips.has("Popular__Sleeper"),
    primo:         chips.has("Popular__Primo"),
    evening:       chips.has("Popular__6PM-12AM"),
    singleSeater:  chips.has("Single Seater / Sleeper__Single Seater"),
    singleSleeper: chips.has("Single Seater / Sleeper__Single Sleeper"),
    depTime:  dep,
    arrTime:  arr,
    boarding: board,
    dropping: drop,
    ops:      op,
    amens:    am,
  });

  // ── Chip toggle ───────────────────────────────────────────────────────────
  const toggleChip = (key) => {
    const next = new Set(chipSelected);
    next.has(key) ? next.delete(key) : next.add(key);

    // Cross-sync AC
    if (key === "Popular__AC") {
      next.has("Popular__AC") ? next.add("Bus Type__AC") : next.delete("Bus Type__AC");
    }
    if (key === "Bus Type__AC") {
      next.has("Bus Type__AC") ? next.add("Popular__AC") : next.delete("Popular__AC");
    }
    // Cross-sync Sleeper
    if (key === "Popular__Sleeper") {
      next.has("Popular__Sleeper") ? next.add("Bus Type__Sleeper") : next.delete("Bus Type__Sleeper");
    }
    if (key === "Bus Type__Sleeper") {
      next.has("Bus Type__Sleeper") ? next.add("Popular__Sleeper") : next.delete("Popular__Sleeper");
    }

    // Popular "6PM-12AM" → sync depTime slot
    let nextDep = depTime;
    if (key === "Popular__6PM-12AM") {
      nextDep = new Set(depTime);
      next.has("Popular__6PM-12AM")
        ? nextDep.add(EVENING_DEP_SLOT)
        : nextDep.delete(EVENING_DEP_SLOT);
      setDepTime(nextDep);
    }

    setChipSelected(next);
    onFilterChange(buildFilters({ chips: next, dep: nextDep }));
  };

  // ── Generic set toggle (OR within group — adds to existing selection) ─────
  const toggleSet = (setter, key, type) => {
    setter((prev) => {
      const next = new Set(prev);
      // Toggle: add if not present, remove if already selected
      next.has(key) ? next.delete(key) : next.add(key);

      // "6 PM - 12 AM" depTime ↔ Popular__6PM-12AM cross-sync
      let nextChips = chipSelected;
      if (type === "depTime" && key === EVENING_DEP_SLOT) {
        nextChips = new Set(chipSelected);
        next.has(EVENING_DEP_SLOT)
          ? nextChips.add("Popular__6PM-12AM")
          : nextChips.delete("Popular__6PM-12AM");
        setChipSelected(nextChips);
      }

      // Build filters with the NEW set — OR logic: .some() in filterBuses
      // means buses matching ANY selected slot will show
      onFilterChange(buildFilters({
        chips: nextChips,
        dep:   type === "depTime"  ? next : depTime,
        arr:   type === "arrTime"  ? next : arrTime,
        board: type === "boarding" ? next : boarding,
        drop:  type === "dropping" ? next : dropping,
        op:    type === "ops"      ? next : ops,
        am:    type === "amens"    ? next : amens,
      }));

      return next;
    });
  };

  // ── Clear section ─────────────────────────────────────────────────────────
  const clearSection = (setter, type) => {
    const empty = new Set();
    setter(empty);

    let nextChips = chipSelected;
    if (type === "depTime") {
      nextChips = new Set(chipSelected);
      nextChips.delete("Popular__6PM-12AM");
      setChipSelected(nextChips);
    }

    onFilterChange(buildFilters({
      chips: nextChips,
      dep:   type === "depTime"  ? empty : depTime,
      arr:   type === "arrTime"  ? empty : arrTime,
      board: type === "boarding" ? empty : boarding,
      drop:  type === "dropping" ? empty : dropping,
      op:    type === "ops"      ? empty : ops,
      am:    type === "amens"    ? empty : amens,
    }));
  };

  // ── Clear chip group ──────────────────────────────────────────────────────
  const clearChipGroup = (prefix) => {
    const next = new Set(chipSelected);
    [...next].forEach((k) => { if (k.startsWith(prefix)) next.delete(k); });

    let nextDep = depTime;
    if (prefix === "Popular__" && chipSelected.has("Popular__6PM-12AM")) {
      nextDep = new Set(depTime);
      nextDep.delete(EVENING_DEP_SLOT);
      setDepTime(nextDep);
    }
    if (prefix === "Bus Type__") {
      next.delete("Popular__AC");
      next.delete("Popular__Sleeper");
    }

    setChipSelected(next);
    onFilterChange(buildFilters({ chips: next, dep: nextDep }));
  };

  // ── Clear ALL ─────────────────────────────────────────────────────────────
  const clearAll = () => {
    const empty = new Set();
    setChipSelected(empty);
    setDepTime(empty);
    setArrTime(empty);
    setBoarding(empty);
    setDropping(empty);
    setOps(empty);
    setAmens(empty);
    onFilterChange({
      ac: false, nonAc: false, seater: false, sleeper: false,
      primo: false, evening: false,
      singleSeater: false, singleSleeper: false,
      depTime: empty, arrTime: empty, boarding: empty,
      dropping: empty, ops: empty, amens: empty,
    });
  };

  const anyActive =
    chipSelected.size > 0 || depTime.size > 0 || arrTime.size > 0 ||
    boarding.size > 0 || dropping.size > 0 || ops.size > 0 || amens.size > 0;

  // ── Time grid ─────────────────────────────────────────────────────────────
  const TimeGrid = ({ title, selected, setSelected, type }) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={() => clearSection(setSelected, type)}
          disabled={selected.size === 0}
          className={`text-xs font-bold ${
            selected.size === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => {
          const isActive = selected.has(slot.label);
          return (
            <button
              key={slot.label}
              onClick={() => toggleSet(setSelected, slot.label, type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                isActive
                  ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                  : "border-gray-300 text-muted-foreground"
              }`}
            >
              {slot.icon}
              <span className="text-center leading-tight">{slot.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Chip group ────────────────────────────────────────────────────────────
  const ChipGroup = ({ title, options }) => (
    <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={() => clearChipGroup(`${title}__`)}
          disabled={!options.some((o) => chipSelected.has(`${title}__${o.label}`))}
          className={`text-xs font-bold ${
            !options.some((o) => chipSelected.has(`${title}__${o.label}`))
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const key      = `${title}__${opt.label}`;
          const isActive = chipSelected.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleChip(key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                isActive
                  ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                  : "border border-gray-300 bg-background text-muted-foreground"
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <aside className="w-full bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-300 -mx-5 px-5">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        <button
          onClick={clearAll}
          disabled={!anyActive}
          className={`text-xs font-bold transition-colors duration-200 ${
            !anyActive ? "text-gray-400 cursor-not-allowed" : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        <ChipGroup title="Popular"                 options={popularOptions} />
        <ChipGroup title="Bus Type"                options={busTypeOptions} />
        <ChipGroup title="Single Seater / Sleeper" options={singleOptions}  />

        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid title="Departure Time" selected={depTime} setSelected={setDepTime} type="depTime" />
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid title="Arrival Time" selected={arrTime} setSelected={setArrTime} type="arrTime" />
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Boarding Point"
            items={boardingPoints}
            searchPlaceholder="Enter/Search boarding point"
            selected={boarding}
            onToggle={(i) => toggleSet(setBoarding, i, "boarding")}
            onClear={() => clearSection(setBoarding, "boarding")}
            initialShow={4}
          />
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Dropping Point"
            items={droppingPoints}
            searchPlaceholder="Enter/Search dropping point"
            selected={dropping}
            onToggle={(i) => toggleSet(setDropping, i, "dropping")}
            onClear={() => clearSection(setDropping, "dropping")}
            initialShow={4}
          />
        </div>

        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Operator"
            items={operators}
            searchPlaceholder="Enter/Search operator"
            selected={ops}
            onToggle={(i) => toggleSet(setOps, i, "ops")}
            onClear={() => clearSection(setOps, "ops")}
            initialShow={4}
          />
        </div>

        <CheckboxSection
          title="Amenities"
          items={["Blankets", "Charging Point", "Reading Light"]}
          searchPlaceholder=""
          selected={amens}
          onToggle={(i) => toggleSet(setAmens, i, "amens")}
          onClear={() => clearSection(setAmens, "amens")}
          showSearch={false}
        />
      </div>
    </aside>
  );
};

export default FiltersSidebar;