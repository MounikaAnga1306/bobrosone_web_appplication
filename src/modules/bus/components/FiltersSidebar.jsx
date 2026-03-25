import { useState, useMemo } from "react";
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
  { label: "AC", icon: <Snowflake className="h-4 w-4" /> },
  { label: "Primo", icon: <Star className="h-4 w-4" /> },
  { label: "6PM-12AM", icon: <Sunset className="h-4 w-4" /> },
  { label: "Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const busTypeOptions = [
  { label: "AC", icon: <Snowflake className="h-4 w-4" /> },
  { label: "Non-AC", icon: <Snowflake className="h-4 w-4 opacity-40" /> },
  { label: "Seater", icon: <Armchair className="h-4 w-4" /> },
  { label: "Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const singleOptions = [
  { label: "Single Seater", icon: <Armchair className="h-4 w-4" /> },
  { label: "Single Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const timeSlots = [
  { label: "12 midnight - 6 AM", icon: <Moon className="h-4 w-4" /> },
  { label: "6 AM - 12 noon", icon: <Sun className="h-4 w-4" /> },
  { label: "12 noon - 6 PM", icon: <CloudSun className="h-4 w-4" /> },
  { label: "6 PM - 12 midnight", icon: <Sunset className="h-4 w-4" /> },
];

// CHANGED: added initialShow + showAll logic, removed showMore prop
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
    i.toLowerCase().includes(search.toLowerCase()),
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
            <label
              key={item}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Checkbox
                checked={selected.has(item)}
                onChange={() => onToggle(item)}
              />
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
          {showAll
            ? "− Show less"
            : `+ Show all ${filtered.length} ${title.toLowerCase()}`}
        </button>
      )}
    </div>
  );
};

// CHANGED: added trips = [] prop
const FiltersSidebar = ({ onFilterChange, trips = [] }) => {
  const [chipSelected, setChipSelected] = useState(new Set());
  const [depTime, setDepTime] = useState(new Set());
  const [arrTime, setArrTime] = useState(new Set());
  const [boarding, setBoarding] = useState(new Set());
  const [dropping, setDropping] = useState(new Set());
  const [ops, setOps] = useState(new Set());
  const [amens, setAmens] = useState(new Set());

  // CHANGED: dynamic from trips instead of static arrays
  // boardingTimes: array or object → extract bpName
  const boardingPoints = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      const raw = t.boardingTimes || [];
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((p) => {
        const name = p?.bpName || p?.name || p?.pointName || null;
        if (name && name.trim()) set.add(name.trim());
      });
    });
    return [...set].sort();
  }, [trips]);

  // droppingTimes: array or object → extract bpName
  const droppingPoints = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      const raw = t.droppingTimes || [];
      const arr = Array.isArray(raw) ? raw : [raw];
      arr.forEach((p) => {
        const name = p?.bpName || p?.name || p?.pointName || null;
        if (name && name.trim()) set.add(name.trim());
      });
    });
    return [...set].sort();
  }, [trips]);

  // operators: from travels field
  const operators = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      const name = t.travels || null;
      if (name && name.trim()) set.add(name.trim());
    });
    return [...set].sort();
  }, [trips]);

  const toggleChip = (key) => {
    // Build next chip set directly (no nested setState)
    const next = new Set(chipSelected);
    next.has(key) ? next.delete(key) : next.add(key);

    // Popular ↔ Bus Type cross-sync
    if (key === "Popular__AC") {
      next.has("Popular__AC") ? next.add("Bus Type__AC") : next.delete("Bus Type__AC");
    }
    if (key === "Bus Type__AC") {
      next.has("Bus Type__AC") ? next.add("Popular__AC") : next.delete("Popular__AC");
    }
    if (key === "Popular__Sleeper") {
      next.has("Popular__Sleeper") ? next.add("Bus Type__Sleeper") : next.delete("Bus Type__Sleeper");
    }
    if (key === "Bus Type__Sleeper") {
      next.has("Bus Type__Sleeper") ? next.add("Popular__Sleeper") : next.delete("Popular__Sleeper");
    }

    // Popular "6PM-12AM" → sync depTime
    let nextDep = depTime;
    if (key === "Popular__6PM-12AM") {
      nextDep = new Set(depTime);
      next.has("Popular__6PM-12AM")
        ? nextDep.add("6 PM - 12 midnight")
        : nextDep.delete("6 PM - 12 midnight");
      setDepTime(nextDep);
    }

    setChipSelected(next);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    onFilterChange({
      ac:      next.has("Bus Type__AC"),
      nonAc:   next.has("Bus Type__Non-AC"),
      seater:  next.has("Bus Type__Seater"),
      sleeper: next.has("Bus Type__Sleeper"),
      primo:   next.has("Popular__Primo"),
      evening: next.has("Popular__6PM-12AM"),
      depTime: nextDep,
      arrTime,
      boarding,
      dropping,
      ops,
      amens,
    });
  };

  const toggleSet = (setter, key, type) => {
  setter((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);

    // CHANGED: Departure "6 PM - 12 midnight" → sync Popular chip
    if (type === "depTime" && key === "6 PM - 12 midnight") {
      setChipSelected((prevChips) => {
        const nextChips = new Set(prevChips);
        next.has("6 PM - 12 midnight")
          ? nextChips.add("Popular__6PM-12AM")
          : nextChips.delete("Popular__6PM-12AM");
        return nextChips;
      });
    }

    const newFilters = {
      ac:       chipSelected.has("Bus Type__AC"),
      nonAc:    chipSelected.has("Bus Type__Non-AC"),
      seater:   chipSelected.has("Bus Type__Seater"),
      sleeper:  chipSelected.has("Bus Type__Sleeper"),
      primo:    chipSelected.has("Popular__Primo"),
      evening:  type === "depTime" && key === "6 PM - 12 midnight"
                  ? next.has("6 PM - 12 midnight")
                  : chipSelected.has("Popular__6PM-12AM"),
      depTime:  type === "depTime"  ? next : depTime,
      arrTime:  type === "arrTime"  ? next : arrTime,
      boarding: type === "boarding" ? next : boarding,
      dropping: type === "dropping" ? next : dropping,
      ops:      type === "ops"      ? next : ops,
      amens:    type === "amens"    ? next : amens,
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
    onFilterChange(newFilters);

    return next;
  });
};

  const clearSet = (setter) => setter(new Set());

 const clearAll = () => {
  setChipSelected(new Set());
  setDepTime(new Set());
  setArrTime(new Set());
  setBoarding(new Set());
  setDropping(new Set());
  setOps(new Set());
  setAmens(new Set());

 window.scrollTo({ top: 0, behavior: 'smooth' });
 onFilterChange({
  ac: false,
  nonAc: false,
  seater: false,
  sleeper: false,
  primo: false,
  evening: false,
  depTime: new Set(),
  arrTime: new Set(),
  boarding: new Set(),
  dropping: new Set(),
  ops: new Set()
});
 }

  const TimeGrid = ({ title, selected, setSelected }) => (
    <div>
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => {
          const isActive = selected.has(slot.label);
          return (
            <button
              key={slot.label}
             onClick={() =>
  toggleSet(
    setSelected,
    slot.label,
    title === "Departure Time" ? "depTime" : "arrTime"
  )
}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs  transition-all ${
                isActive
                  ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                  : "border-gray-300  text-muted-foreground "
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

  return (
    <aside className="w-full bg-white rounded-xl shadow-sm  p-5  top-24">
      <div className="flex items-center justify-between mb-5 pb-3  border-b border-gray-300 -mx-5 px-5">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        <button
          onClick={clearAll}
          disabled={
            chipSelected.size === 0 &&
            depTime.size === 0 &&
            arrTime.size === 0 &&
            boarding.size === 0 &&
            dropping.size === 0 &&
            ops.size === 0 &&
            amens.size === 0
          }
          className={`text-xs font-bold transition-colors duration-200 ${
            chipSelected.size === 0 &&
            depTime.size === 0 &&
            arrTime.size === 0 &&
            boarding.size === 0 &&
            dropping.size === 0 &&
            ops.size === 0 &&
            amens.size === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {[
          { title: "Popular", options: popularOptions },
          { title: "Bus Type", options: busTypeOptions },
          { title: "Single Seater / Sleeper", options: singleOptions },
        ].map(({ title, options }) => (
          <div
            key={title}
            className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5"
          >
            <h3 className="text-sm font-bold  text-foreground uppercase tracking-wide mb-3">
              {title}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => {
                const key = `${title}__${opt.label}`;
                const isActive = chipSelected.has(key);

                return (
                  <button
                    key={key}
                    onClick={() => toggleChip(key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border   text-xs  transition-all ${
                      isActive
                        ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                        : "border border-gray-300 bg-background text-muted-foreground "
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid
            title="Departure Time"
            selected={depTime}
            setSelected={setDepTime}
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid
            title="Arrival Time"
            selected={arrTime}
            setSelected={setArrTime}
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Boarding Point"
            items={boardingPoints}
            searchPlaceholder="Enter/Search boarding point"
            selected={boarding}
            onToggle={(i) => toggleSet(setBoarding, i, "boarding")}
            onClear={() => clearSet(setBoarding)}
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
            onClear={() => clearSet(setDropping)}
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
            onClear={() => clearSet(setOps)}
            initialShow={4}
          />
        </div>

        <CheckboxSection
          title="Amenities"
          items={["Blankets", "Charging Point", "Reading Light"]}
          searchPlaceholder=""
          selected={amens}
          onToggle={(i) => toggleSet(setAmens, i, "amens")}
          onClear={() => clearSet(setAmens)}
          showSearch={false}
        />
      </div>
    </aside>
  );

};

export default FiltersSidebar;