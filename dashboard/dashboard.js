 document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Navigation item switching
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Card navigation dots
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', function() {
                document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Animate bars on load
        window.addEventListener('load', () => {
            document.querySelectorAll('.bar').forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.opacity = '0';
                    bar.style.opacity = '1';
                }, index * 50);
            });
        });