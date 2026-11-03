# Projects

The projects Elle Brauchle shows on this site. Five are listed on the Projects
page, each with its own page behind the card; the site itself is a sixth.
Last updated 2026-11-02.

## The Curated Shelf

The Curated Shelf is Elle's personal collection of things she wants to try,
kept in bins: a Book Bin, a Restaurant Bin, and so on. Its cover calls it
"Vol. I — Personal Collection" and "something new to try". Each shelf fills up
with what is waiting, and a plus button adds something new.

She built it with Lovable. Its page on the site is curated-shelf.html. There is
no public link or repo for it yet, and no fuller write-up, so anyone wanting
detail should ask Elle.

## Hackachusetts 2026: heat island planning tool

At Hackachusetts 2026, a Boston hackathon run by Sundai, Elle and her teammate
Ronaldo Fernandes built a heat island planning tool for city officials. Boston's
hottest afternoons are not evenly hot: the neighborhoods with the least tree
canopy run several degrees warmer than ones that can afford shade.

The tool lets an official track the current state of the heat island effect
across Boston neighborhoods, hear from residents about outdoor comfort, and use
a simulator to see how actions such as planting trees, tree mix, cool roofs and
budget affect those temperatures.

The Projects page links to the event at
sundai.club/events/boston/hackachusetts-with-kiro.

## Petal Ping

Petal Ping is an integration tool that connects to health apps a person already
uses, such as Apple Health, Flo or Natural Cycles, to track menstrual cycles and
symptoms and deliver tailored push notifications. Those are heads-up reminders
for upcoming cycles or symptoms, research-backed health tips, and alerts when a
longer-term trend emerges. A companion app displays the history, with an export
option for medical appointments.

Petal Ping's page on the site is petal-ping.html, and it links to the code at
github.com/ellebrauchle/Cycle-Tracking.

Elle is building it solo, as a free alternative to tools that are either too
limited or too costly. Apple Health offers basic cycle prediction with limited
symptom logging; more capable apps like Flo are typically paid. She chose to
build rather than adopt partly to learn to build software herself.

It starts as a personal tool for Elle, with potential to expand to anyone
managing periods, especially people with irregular or challenging cycles, and
eventually to other health-tracking needs.

## Petal Ping: current scope and status

The current sprint, for the AI Builder Space Proseminar at MIT Sloan, covers the
smallest useful version: pulling real cycle and symptom data from a health app,
sending predictive heads-up notifications, and delivering research-backed tips.
Trend alerts, the medical export and a fully built companion app are out of
scope for now.

Success for the sprint means the integration pulls real data and sends at least
one real predictive notification and one research-backed tip. Predictive
accuracy cannot be fully validated inside the sprint because cycle tracking
works month by month.

Open questions include which app will serve as the data source given Apple
Health integration difficulties, whether data can be pulled automatically or
only by manual export, how notification frequency should be tuned, and how to
fold user feedback into the alerts. The product brief is dated September 30,
2026.

## Task Nest

Task Nest is Elle's collection of productivity tools, ranging from email
condensers to job trackers. It is a set of small tools rather than one product.
It has its own page on the site, task-nest.html, but that page is short: there
is no public repo, live link or write-up for it yet.

## Envelopes: envelope budgeting in a Google Sheet

Envelopes is Elle's personal budgeting tool. It brings the classic envelope
budgeting method into an automated Google Sheet: money is divided between
monthly spending categories, or "envelopes", and the sheet tracks how much is
left in each one.

It securely pulls transactions from credit cards and Venmo through the Plaid
API, and sorts each charge into a category using customizable rules, so the
categorizing is not done by hand.

## Envelopes: how it runs

Envelopes is built with Google Apps Script. It runs on a daily schedule and
sends email alerts when a spending category approaches its limit, which turns
a manual spreadsheet into a hands-off system for staying on budget.

Its page on the site is envelopes.html. There is no public repo for it yet.

## Project C is the old name for Envelopes

The card now called Envelopes was labelled "Project C" while the project was
unannounced. Project C is not a separate project; anyone asking about Project C
means Envelopes.

## This website

Elle built this site herself. It is a static site with no build step, written in
plain HTML and CSS, laid out from a Claude Design direction, and deployed on
Vercel. The "Curious?" chat in the corner is part of it.

## Case studies and code

There are no written case studies on the site yet, and no project links to its
own page. The Projects page links to Elle's GitHub profile at
github.com/ellebrauchle, which is the only code link published.

## What Elle is building at Sloan

Her resume lists her current projects as Petal Ping, this personal website, and
various productivity tools. The AI Builder Proseminar and Product Management Lab
are the courses most directly connected to this work.
