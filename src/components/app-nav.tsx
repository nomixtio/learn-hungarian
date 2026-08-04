import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState } from 'react';

import { APP_NAME } from '@/lib/app';
import { courses } from '@/lib/courses/registry';

export function AppNav() {
	const [open, setOpen] = useState(false);
	const [coursesOpen, setCoursesOpen] = useState(false);
	const menuId = useId();
	const coursesId = useId();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const onLearn = pathname.startsWith('/learn/');

	useEffect(() => {
		if (onLearn) {
			setCoursesOpen(true);
		}
	}, [onLearn]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false);
				buttonRef.current?.focus();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	const closeMenu = () => setOpen(false);

	return (
		<header className="relative z-40 w-full shrink-0 border-b border-border bg-bg/70 backdrop-blur-xl">
			<div className="relative z-50 mx-auto flex max-w-[800px] items-center gap-3 px-4 py-3 sm:px-6">
				<button
					ref={buttonRef}
					type="button"
					className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text hover:bg-bg-selected active:opacity-70"
					aria-label={open ? 'Close menu' : 'Open menu'}
					aria-expanded={open}
					aria-controls={menuId}
					onClick={() => setOpen((value) => !value)}>
					<span className="relative block h-3.5 w-5" aria-hidden="true">
						<span
							className={`absolute left-0 block h-0.5 w-5 rounded-full bg-text transition-transform duration-200 ${
								open ? 'top-1.5 rotate-45' : 'top-0'
							}`}
						/>
						<span
							className={`absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-text transition-opacity duration-200 ${
								open ? 'opacity-0' : 'opacity-100'
							}`}
						/>
						<span
							className={`absolute left-0 block h-0.5 w-5 rounded-full bg-text transition-transform duration-200 ${
								open ? 'top-1.5 -rotate-45' : 'top-3'
							}`}
						/>
					</span>
				</button>

				<p className="m-0 flex min-w-0 flex-1 items-center gap-2.5 truncate">
					<span
						className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#2ee06c] to-[#0b6b3a] font-display text-sm font-bold text-[#052e16] shadow-[0_0_14px_rgba(34,197,94,0.35)]"
						aria-hidden="true">
						H
					</span>
					<span className="truncate font-display text-sm leading-5 font-semibold sm:text-base">
						{APP_NAME}
					</span>
				</p>
			</div>

			{open ? (
				<>
					<button
						type="button"
						className="fixed inset-0 z-40 cursor-default border-0 bg-black/40 p-0"
						aria-label="Close menu"
						onClick={closeMenu}
					/>
					<nav
						id={menuId}
						aria-label="Main"
						className="absolute top-full left-0 z-50 flex w-[min(100%,20rem)] flex-col rounded-br-2xl border-r border-b border-border bg-bg-element/95 shadow-2xl backdrop-blur-xl">
						<ul className="m-0 list-none p-2">
							<li>
								<Link
									to="/"
									activeOptions={{ exact: true }}
									onClick={closeMenu}
									className="block rounded-lg px-3 py-2.5 text-sm leading-5 font-semibold text-text-secondary no-underline hover:bg-bg-selected hover:text-text [&.active]:bg-accent-soft [&.active]:text-accent">
									Live translation
								</Link>
							</li>
							<li>
								<button
									type="button"
									className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm leading-5 font-semibold text-text-secondary hover:bg-bg-selected hover:text-text"
									aria-expanded={coursesOpen}
									aria-controls={coursesId}
									onClick={() => setCoursesOpen((value) => !value)}>
									<span>Courses</span>
									<span
										className={`block h-2 w-2 border-r-2 border-b-2 border-current transition-transform duration-200 ${
											coursesOpen ? 'rotate-45' : '-rotate-45'
										}`}
										aria-hidden="true"
									/>
								</button>
								{coursesOpen ? (
									<ul id={coursesId} className="m-0 list-none py-1 pl-3">
										{courses.map((course) => (
											<li key={course.id}>
												<Link
													to="/learn/$courseSlug"
													params={{ courseSlug: course.slug }}
													onClick={closeMenu}
													className="block rounded-lg px-3 py-2 text-sm leading-5 font-medium text-text-secondary no-underline hover:bg-bg-selected hover:text-text [&.active]:bg-accent-soft [&.active]:text-accent">
													{course.title}
												</Link>
											</li>
										))}
									</ul>
								) : null}
							</li>
							<li>
								<Link
									to="/quiz"
									onClick={closeMenu}
									className="block rounded-lg px-3 py-2.5 text-sm leading-5 font-semibold text-text-secondary no-underline hover:bg-bg-selected hover:text-text [&.active]:bg-accent-soft [&.active]:text-accent">
									Quiz
								</Link>
							</li>
							<li>
								<Link
									to="/settings"
									onClick={closeMenu}
									className="block rounded-lg px-3 py-2.5 text-sm leading-5 font-semibold text-text-secondary no-underline hover:bg-bg-selected hover:text-text [&.active]:bg-accent-soft [&.active]:text-accent">
									Settings
								</Link>
							</li>
						</ul>
					</nav>
				</>
			) : null}
		</header>
	);
}
