import { useEffect, useState } from "react";
import { FileText, Printer, Save, RefreshCw } from "lucide-react";
import { sb } from "../lib/supabase";
import { ymd, parse, mins, hrs, WD, autoDtr, suspLabel } from "../lib/schedule";
import Btn from "./ui/Button";
import MonthNav from "./MonthNav";
import { useConfirm } from "./ConfirmProvider";

const BLANK = {
  am_in: "",
  am_out: "",
  pm_in: "",
  pm_out: "",
};

export default function Dtr({
  month,
  setMonth,
  userId,
  occ,
  suspensions,
  notify,
}) {
  const confirm = useConfirm();
  const [saved, setSaved] = useState({});
  const [edits, setEdits] = useState({});
  const [loaded, setLoaded] = useState(false);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const first = ymd(new Date(month.getFullYear(), month.getMonth(), 1));
  const last = ymd(new Date(month.getFullYear(), month.getMonth(), days));
  const dates = Array.from({ length: days }, (_, i) =>
    ymd(new Date(month.getFullYear(), month.getMonth(), i + 1)),
  );

  /* ---------------------------------------------
     LOAD SAVED DTR
  --------------------------------------------- */
  useEffect(() => {
    setLoaded(false);
    setEdits({});

    sb.from("dtr")
      .select("*")
      .eq("user_id", userId)
      .gte("date", first)
      .lte("date", last)
      .then(({ data }) => {
        const m = {};

        (data || []).forEach((r) => {
          m[r.date] = {
            am_in: r.am_in?.slice(0, 5) || "",
            am_out: r.am_out?.slice(0, 5) || "",
            pm_in: r.pm_in?.slice(0, 5) || "",
            pm_out: r.pm_out?.slice(0, 5) || "",
          };
        });

        setSaved(m);
        setLoaded(true);
      });
  }, [userId, first, last]);

  /* ---------------------------------------------
     AUTOMATIC DTR TIMES FROM CLASS SCHEDULE
  --------------------------------------------- */
  const auto = (date) => autoDtr(occ(date));

  const rowFor = (date) => {
    if (!loaded) return BLANK;

    return {
      ...(saved[date] || auto(date)),
      ...(edits[date] || {}),
    };
  };

  /* ---------------------------------------------
     ACTUAL CLASS HOURS
     
     Only actual scheduled classes are counted.
     Vacant periods are completely ignored.
     
     Rendered = Lab + Lecture
  --------------------------------------------- */
  const classHours = (classes) => {
    let lab = 0;
    let lecture = 0;

    classes.forEach((c) => {
      const start = mins(c.start_time);
      const end = mins(c.end_time);

      if (start === null || end === null || end <= start) {
        return;
      }

      const duration = end - start;

      if (c.class_type === "lab") {
        lab += duration;
      } else if (c.class_type === "lecture") {
        lecture += duration;
      }
    });

    return {
      lab,
      lecture,
      rendered: lab + lecture,
    };
  };

  /* ---------------------------------------------
     EDIT DTR
  --------------------------------------------- */
  const edit = (date, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [key]: value,
      },
    }));
  };

  /* ---------------------------------------------
     AUTO-FILL
  --------------------------------------------- */
  const autoFill = async () => {
    const ok = await confirm({
      title: "Auto-fill DTR",
      message:
        "Replace this month's times with the ones from your class schedule? Unsaved changes will be lost.",
      confirmText: "Auto-fill",
    });

    if (!ok) return;

    const e = {};

    dates.forEach((date) => {
      e[date] = auto(date);
    });

    setEdits(e);

    notify(
      "DTR filled from your class schedule. Click Save DTR to keep it.",
      "success",
    );
  };

  /* ---------------------------------------------
     SAVE
  --------------------------------------------- */
  const save = async () => {
    const rows = dates
      .map((date) => ({
        date,
        row: rowFor(date),
      }))
      .filter(
        ({ date, row }) =>
          saved[date] ||
          edits[date] ||
          row.am_in ||
          row.am_out ||
          row.pm_in ||
          row.pm_out,
      );

    if (!rows.length) {
      return notify("Nothing to save for this month.", "warn");
    }

    const payload = rows.map(({ date, row }) => ({
      user_id: userId,
      date,
      am_in: row.am_in || null,
      am_out: row.am_out || null,
      pm_in: row.pm_in || null,
      pm_out: row.pm_out || null,
    }));

    const { error } = await sb.from("dtr").upsert(payload);

    if (error) {
      return notify(error.message, "error");
    }

    setSaved((prev) => {
      const next = { ...prev };

      rows.forEach(({ date, row }) => {
        next[date] = row;
      });

      return next;
    });

    setEdits({});

    notify(
      "DTR saved for " +
      month.toLocaleString("en", {
        month: "long",
        year: "numeric",
      }),
      "success",
    );
  };

  /* ---------------------------------------------
     MONTHLY x DATA
  --------------------------------------------- */
  let totalRendered = 0;
  let totalLab = 0;
  let totalLecture = 0;

  const list = dates.map((date, index) => {
    const classes = occ(date);
    const row = rowFor(date);

    const susp = suspensions.filter((x) => x.date === date);

    const h = classHours(classes);

    totalRendered += h.rendered;
    totalLab += h.lab;
    totalLecture += h.lecture;

    return {
      date,
      day: index + 1,
      dow: parse(date).getDay(),
      row,
      rendered: h.rendered,
      lab: h.lab,
      lecture: h.lecture,
      susp,
    };
  });

  /* ---------------------------------------------
     RENDERxxx
  --------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            Daily Time Record
          </h2>

          <p className="text-sm text-slate-500">
            {month.toLocaleString("en", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <MonthNav month={month} setMonth={setMonth} />

          <Btn onClick={autoFill} variant="secondary">
            <RefreshCw size={16} />
            Auto-fill
          </Btn>

          <Btn onClick={save} variant="primary">
            <Save size={16} />
            Save DTR
          </Btn>

          <Btn onClick={() => window.print()} variant="secondary">
            <Printer size={16} />
            Print
          </Btn>
        </div>
      </div>

      {/* EXPLANATION */}
      <div className="rounded-lg border bg-slate-50 p-3 text-sm">
        <div className="font-medium text-slate-700 mb-1">
          How the hours are calculated
        </div>

        <div className="text-slate-600 space-y-1">
          <div>
            <strong>Rendered</strong> = actual teaching hours only.
          </div>

          <div>
            <strong>Rendered = Lab + Lecture</strong>
          </div>

          <div>
            Vacant periods between classes are excluded from Rendered, Lab, and
            Lecture.
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b">
              <th className="px-3 py-2 text-left">Day</th>

              <th className="px-3 py-2 text-center">AM Arrival</th>

              <th className="px-3 py-2 text-center">AM Departure</th>

              <th className="px-3 py-2 text-center">PM Arrival</th>

              <th className="px-3 py-2 text-center">PM Departure</th>

              <th className="px-3 py-2 text-center bg-slate-700 text-white">
                Rendered
              </th>

              <th className="px-3 py-2 text-center bg-emerald-50">Lab</th>

              <th className="px-3 py-2 text-center bg-indigo-50">Lecture</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => {
              const { date, day, dow, row, rendered, lab, lecture, susp } =
                item;

              return (
                <tr key={date} className="border-b hover:bg-slate-50">
                  {/* DAY */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium">
                      {day} {WD[dow]}
                    </div>

                    {susp.length > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {susp.map((s, i) => (
                          <div key={i}>{suspLabel(s)}</div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* AM IN */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="time"
                      value={row.am_in || ""}
                      onChange={(e) => edit(date, "am_in", e.target.value)}
                      className="w-[110px] rounded border px-2 py-1 text-center"
                    />
                  </td>

                  {/* AM OUT */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="time"
                      value={row.am_out || ""}
                      onChange={(e) => edit(date, "am_out", e.target.value)}
                      className="w-[110px] rounded border px-2 py-1 text-center"
                    />
                  </td>

                  {/* PM IN */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="time"
                      value={row.pm_in || ""}
                      onChange={(e) => edit(date, "pm_in", e.target.value)}
                      className="w-[110px] rounded border px-2 py-1 text-center"
                    />
                  </td>

                  {/* PM OUT */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="time"
                      value={row.pm_out || ""}
                      onChange={(e) => edit(date, "pm_out", e.target.value)}
                      className="w-[110px] rounded border px-2 py-1 text-center"
                    />
                  </td>

                  {/* RENDERED */}
                  <td className="px-3 py-2 text-center font-bold bg-slate-700 text-white">
                    {rendered > 0 ? hrs(rendered) : "—"}
                  </td>

                  {/* LAB */}
                  <td className="px-3 py-2 text-center bg-emerald-50">
                    {lab > 0 ? hrs(lab) : "—"}
                  </td>

                  {/* LECTURE */}
                  <td className="px-3 py-2 text-center bg-indigo-50">
                    {lecture > 0 ? hrs(lecture) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* TOTAL */}
          <tfoot>
            <tr className="bg-slate-100 font-semibold border-t-2">
              <td colSpan={5} className="px-3 py-3 text-right">
                Monthly Total
              </td>

              <td className="px-3 py-3 text-center bg-slate-700 text-white">
                {hrs(totalRendered)}
              </td>

              <td className="px-3 py-3 text-center bg-emerald-100">
                {hrs(totalLab)}
              </td>

              <td className="px-3 py-3 text-center bg-indigo-100">
                {hrs(totalLecture)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* MONTHLY SUMMARY */}
      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Monthly Hours Summary
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* LAB */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="text-xs text-emerald-700">Lab Hours</div>

            <div className="text-xl font-bold text-emerald-800">
              {hrs(totalLab)}
            </div>
          </div>

          {/* LECTURE */}
          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
            <div className="text-xs text-indigo-700">Lecture Hours</div>

            <div className="text-xl font-bold text-indigo-800">
              {hrs(totalLecture)}
            </div>
          </div>

          {/* RENDERED */}
          <div className="rounded-lg bg-slate-700 border border-slate-700 p-3">
            <div className="text-xs text-slate-200">Rendered Hours</div>

            <div className="text-xl font-bold text-white">
              {hrs(totalRendered)}
            </div>

            <div className="text-xs text-slate-300 mt-1">Lab + Lecture</div>
          </div>
        </div>
      </div>
    </div>
  );
}
