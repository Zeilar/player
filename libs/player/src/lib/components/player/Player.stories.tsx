import { Story, Meta } from "@storybook/react";
import { Player, PlayerProps } from ".";

export default {
	component: Player,
	title: "Player",
} as Meta;

const Template: Story<PlayerProps> = args => (
	<div style={{ maxWidth: 1000 }}>
		<Player {...args} />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {
	src: { default: "/video.mp4", 480: "/480p.mp4" },
	captions: [{ language: "en", src: "/subtitles.vtt", label: "English" }],
};
