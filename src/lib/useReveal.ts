export function initReveal(): () => void {
	const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduce || !('IntersectionObserver' in window)) {
		nodes.forEach(node => node.classList.add('is-in'));
		return () => {};
	}

	const observer = new IntersectionObserver(
		entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				}
			}
		},
		{ rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
	);

	nodes.forEach(node => observer.observe(node));
	return () => observer.disconnect();
}
