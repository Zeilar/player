import { Story, Meta } from "@storybook/react";
import { Player, PlayerProps } from ".";

export default {
	component: Player,
	title: "Player",
} as Meta;

const Template: Story<PlayerProps> = args => (
	<div style={{ width: 1000 }}>
		<Player {...args} />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {
	qualities: [
		{ src: "/subtitles.mp4", id: 1, label: "Default" },
		{ src: "/1080.mp4", id: 5, label: "1080p" },
		{ src: "/720.mp4", id: 4, label: "720p" },
		{ src: "/640.mp4", id: 3, label: "640p" },
		{ src: "/480.mp4", id: 2, label: "480p" },
	],
	captions: [{ language: "en", src: "/subtitles.vtt", label: "English" }],
};
