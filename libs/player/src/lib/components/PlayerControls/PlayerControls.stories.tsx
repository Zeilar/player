import { Story, Meta } from "@storybook/react";
import { PlayerControls, PlayerControlsProps } from ".";

export default {
	component: PlayerControls,
	title: "PlayerControls",
} as Meta;

const Template: Story<PlayerControlsProps> = args => (
	<PlayerControls {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
	player: null,
};
